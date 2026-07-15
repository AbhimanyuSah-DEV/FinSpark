import uuid
import logging
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.login_history import LoginHistory
from app.models.incident import RiskLevel
from app.schemas.transaction import TransferRequest, TransactionResponse, TransactionWithSenderName
from app.schemas.dashboard import UserDashboardResponse
from app.middleware.auth import get_current_user
from app.utils.security import verify_password

# Intelligence pipeline services
from app.services.behaviour_engine import get_or_create_profile, analyse_deviation, update_profile_incrementally
from app.services.correlation_engine import correlate
from app.services.fraud_client import get_fraud_prediction
from app.services.risk_engine import compute_risk
from app.services.timeline_builder import build_timeline
from app.services.incident_builder import build_and_save_incident
from app.services.quantum_module import assess_quantum_risk
from app.services.llm_service import generate_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/dashboard", response_model=UserDashboardResponse)
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return account overview and recent transactions for the authenticated user."""
    recent_txns = (
        db.query(Transaction)
        .filter(Transaction.sender_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
        .limit(10)
        .all()
    )
    total = db.query(Transaction).filter(Transaction.sender_id == current_user.id).count()

    return UserDashboardResponse(
        full_name=current_user.full_name,
        account_number=current_user.account_number,
        balance=float(current_user.balance),
        recent_transactions=recent_txns,
        total_transactions=total,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
def get_my_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return paginated transaction history for the authenticated user."""
    return (
        db.query(Transaction)
        .filter(Transaction.sender_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/transfer", status_code=status.HTTP_201_CREATED)
def transfer(
    payload: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Initiate a money transfer.

    This endpoint triggers the full Threat Intelligence Pipeline:
      1. Store transaction
      2. Fetch behaviour profile
      3. Analyse deviation
      4. Read login history
      5. Correlation Engine
      6. Fraud AI Model
      7. Risk Engine
      8. Timeline Builder
      9. Incident Builder
      10. Quantum Risk Module
      11. LLM Summary (for MEDIUM+)
      12. Save Incident
      13. Return enriched Incident JSON

    The frontend receives the complete incident object in the response.
    """
    # ── Validate receiver ──────────────────────────────────────────────────────
    receiver = db.query(User).filter(User.account_number == payload.receiver_account).first()

    # ── Verify password ────────────────────────────────────────────────────────
    if not verify_password(payload.password, current_user.password_hash):
        raise HTTPException(status_code=403, detail="Invalid password. Transfer cancelled.")

    # ── Validate balance ───────────────────────────────────────────────────────
    if float(current_user.balance) < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # ── [1] Store transaction ──────────────────────────────────────────────────
    transaction = Transaction(
        id=uuid.uuid4(),
        sender_id=current_user.id,
        receiver_id=receiver.id if receiver else None,
        receiver_account=payload.receiver_account,
        amount=payload.amount,
        merchant=payload.merchant,
        transaction_type=payload.transaction_type,
        timestamp=datetime.now(timezone.utc),
        device=payload.device,
        ip_address=payload.ip_address,
        location=payload.location,
        status=TransactionStatus.PENDING,
        description=payload.description,
    )
    db.add(transaction)
    db.flush()  # get transaction.id without committing yet

    # ── [2] Fetch behaviour profile ────────────────────────────────────────────
    profile = get_or_create_profile(current_user.id, db)

    # ── [3] Analyse behaviour deviation ───────────────────────────────────────
    behaviour_report = analyse_deviation(profile, transaction)

    # ── [4] Read login history (most recent first) ─────────────────────────────
    login_history = (
        db.query(LoginHistory)
        .filter(LoginHistory.user_id == current_user.id)
        .order_by(LoginHistory.login_time.desc())
        .limit(20)
        .all()
    )

    # ── [5] Correlation Engine ─────────────────────────────────────────────────
    correlation_result = correlate(transaction, behaviour_report, login_history)

    # ── [6] Fraud AI Model ─────────────────────────────────────────────────────
    fraud_result = get_fraud_prediction(transaction)

    # ── [7] Risk Engine ────────────────────────────────────────────────────────
    risk_level, overall_score = compute_risk(
        fraud_result, behaviour_report, correlation_result, payload.amount
    )

    # ── [8] Timeline Builder ───────────────────────────────────────────────────
    # Temporary incident ID for timeline — will be replaced by actual
    temp_incident_id = f"INC-PENDING"
    timeline = build_timeline(transaction, login_history, risk_level, temp_incident_id)

    # ── [9] Quantum Risk Module ────────────────────────────────────────────────
    quantum_result = assess_quantum_risk(login_history)

    # ── [10] LLM Summary (MEDIUM, HIGH, CRITICAL) ──────────────────────────────
    if risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL):
        llm_result = generate_summary(
            incident_type=correlation_result.incident_type,
            risk_level=risk_level,
            signals=correlation_result.signals,
            transaction_amount=payload.amount,
            affected_user=current_user.full_name,
            fraud_probability=fraud_result.fraud_probability,
        )
    else:
        # LOW risk — minimal summary
        from app.services.llm_service import LLMSummaryResult
        llm_result = LLMSummaryResult(
            incident_summary=f"Low-risk transaction of ₹{payload.amount:,.2f} completed normally.",
            why_suspicious="No significant anomalies detected.",
            business_impact="No material business impact.",
            recommended_actions=["No action required"],
        )

    # ── [11] Build & Save Incident ─────────────────────────────────────────────
    incident = build_and_save_incident(
        transaction=transaction,
        user=current_user,
        behaviour_report=behaviour_report,
        correlation_result=correlation_result,
        fraud_result=fraud_result,
        risk_level=risk_level,
        overall_risk_score=overall_score,
        timeline=timeline,
        quantum_result=quantum_result,
        llm_result=llm_result,
        db=db,
    )

    # Rebuild timeline with actual incident ID
    timeline = build_timeline(transaction, login_history, risk_level, incident.incident_id)
    incident.timeline = timeline

    # ── [12] Process transaction & update status ───────────────────────────────
    if risk_level == RiskLevel.CRITICAL:
        transaction.status = TransactionStatus.BLOCKED
    else:
        current_user.balance = float(current_user.balance) - payload.amount
        if receiver:
            receiver.balance = float(receiver.balance) + payload.amount
            
        if risk_level in (RiskLevel.HIGH, RiskLevel.MEDIUM):
            transaction.status = TransactionStatus.FLAGGED
        else:
            transaction.status = TransactionStatus.COMPLETED

    db.commit()
    db.refresh(incident)

    logger.info(
        f"Transfer complete: {current_user.username} → {payload.receiver_account} "
        f"₹{payload.amount:,.2f} | {incident.incident_id} | {risk_level.value}"
    )

    # ── [13] Return enriched Incident JSON ─────────────────────────────────────
    return {
        "incident_id": incident.incident_id,
        "risk_level": risk_level.value,
        "overall_risk_score": overall_score,
        "incident_type": correlation_result.incident_type,
        "fraud_probability": fraud_result.fraud_probability,
        "fraud_confidence": fraud_result.confidence,
        "correlation_signals": correlation_result.signals,
        "behaviour_deviation_score": behaviour_report.deviation_score,
        "timeline": timeline,
        "ai_summary": llm_result.incident_summary,
        "why_suspicious": llm_result.why_suspicious,
        "business_impact": llm_result.business_impact,
        "recommended_actions": llm_result.recommended_actions,
        "quantum_exposure_score": quantum_result.quantum_exposure_score,
        "quantum_hndl_warning": quantum_result.hndl_warning,
        "quantum_recommendation": quantum_result.recommendation,
        "transaction": {
            "id": str(transaction.id),
            "amount": payload.amount,
            "receiver_account": payload.receiver_account,
            "status": transaction.status.value,
        },
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile information."""
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "username": current_user.username,
        "account_number": current_user.account_number,
        "balance": float(current_user.balance),
        "role": current_user.role.value,
    }


@router.get("/login-history")
def get_login_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the authenticated user's login history."""
    from sqlalchemy import desc
    history = db.query(LoginHistory).filter(LoginHistory.user_id == current_user.id).order_by(desc(LoginHistory.login_time)).limit(20).all()
    return [{
        "id": str(entry.id),
        "timestamp": entry.login_time.isoformat() if entry.login_time else None,
        "location": entry.location or "Unknown",
        "device": f"{entry.browser} on {entry.device}" if (entry.browser and entry.device) else (entry.device or entry.browser or "Unknown"),
        "ip": entry.ip_address or "Unknown",
        "status": entry.login_status.value
    } for entry in history]
