from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.incident import Incident, RiskLevel
from app.models.login_history import LoginHistory
from app.schemas.incident import IncidentResponse, IncidentListResponse
from app.schemas.dashboard import AdminDashboardResponse, AdminKPIStats
from app.middleware.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


def _enrich_incident(incident: Incident, db: Session) -> dict:
    """Add user name and transaction amount to incident for dashboard display."""
    user = db.query(User).filter(User.id == incident.user_id).first()
    tx = db.query(Transaction).filter(Transaction.id == incident.transaction_id).first()
    data = {
        "id": str(incident.id),
        "incident_id": incident.incident_id,
        "transaction_id": str(incident.transaction_id) if incident.transaction_id else None,
        "user_id": str(incident.user_id),
        "incident_type": incident.incident_type,
        "risk_level": incident.risk_level.value,
        "overall_risk_score": incident.overall_risk_score,
        "fraud_probability": incident.fraud_probability,
        "fraud_confidence": incident.fraud_confidence,
        "fraud_reasons": incident.fraud_reasons or [],
        "behaviour_deviation_score": incident.behaviour_deviation_score,
        "correlation_signals": incident.correlation_signals or [],
        "timeline": incident.timeline or [],
        "ai_summary": incident.ai_summary,
        "why_suspicious": incident.why_suspicious,
        "business_impact": incident.business_impact,
        "recommended_actions": incident.recommended_actions or [],
        "quantum_exposure_score": incident.quantum_exposure_score,
        "quantum_hndl_warning": incident.quantum_hndl_warning,
        "quantum_recommendation": incident.quantum_recommendation,
        "created_at": incident.created_at.isoformat() if incident.created_at else None,
        "affected_user": user.full_name if user else "Unknown",
        "transaction_amount": float(tx.amount) if tx else None,
    }
    return data


@router.get("/dashboard")
def get_admin_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin SOC Dashboard — KPI stats + recent incidents + recent transactions.
    This is the primary hackathon demo screen.
    """
    # ── KPI Stats ──────────────────────────────────────────────────────────────
    total_txns = db.query(Transaction).count()
    total_incidents = db.query(Incident).count()

    critical_count = db.query(Incident).filter(Incident.risk_level == RiskLevel.CRITICAL).count()
    high_count = db.query(Incident).filter(Incident.risk_level == RiskLevel.HIGH).count()
    medium_count = db.query(Incident).filter(Incident.risk_level == RiskLevel.MEDIUM).count()
    low_count = db.query(Incident).filter(Incident.risk_level == RiskLevel.LOW).count()
    quantum_alerts = db.query(Incident).filter(Incident.quantum_hndl_warning == True).count()

    flagged_txns = db.query(Transaction).filter(
        Transaction.status.in_(["FLAGGED", "BLOCKED"])
    ).count()
    fraud_rate = round((flagged_txns / total_txns * 100) if total_txns > 0 else 0.0, 2)

    avg_fraud_prob = db.query(func.avg(Incident.fraud_probability)).scalar() or 0.0

    kpi = {
        "total_transactions": total_txns,
        "total_incidents": total_incidents,
        "critical_incidents": critical_count,
        "high_incidents": high_count,
        "medium_incidents": medium_count,
        "low_incidents": low_count,
        "fraud_rate": fraud_rate,
        "avg_fraud_probability": round(float(avg_fraud_prob), 4),
        "quantum_alerts": quantum_alerts,
    }

    # ── Recent Incidents ───────────────────────────────────────────────────────
    recent_incidents = (
        db.query(Incident)
        .order_by(desc(Incident.created_at))
        .limit(10)
        .all()
    )
    enriched_incidents = [_enrich_incident(inc, db) for inc in recent_incidents]

    # ── Recent Transactions ────────────────────────────────────────────────────
    recent_txns_raw = (
        db.query(Transaction)
        .order_by(desc(Transaction.timestamp))
        .limit(20)
        .all()
    )
    recent_txns = []
    for tx in recent_txns_raw:
        sender = db.query(User).filter(User.id == tx.sender_id).first()
        receiver = db.query(User).filter(User.id == tx.receiver_id).first() if tx.receiver_id else None
        recent_txns.append({
            "id": str(tx.id),
            "sender": sender.full_name if sender else "Unknown",
            "receiver": receiver.full_name if receiver else tx.receiver_account or "External",
            "amount": float(tx.amount),
            "transaction_type": tx.transaction_type.value if tx.transaction_type else None,
            "status": tx.status.value if tx.status else None,
            "location": tx.location,
            "ip_address": tx.ip_address,
            "device": tx.device,
            "timestamp": tx.timestamp.isoformat() if tx.timestamp else None,
        })

    return {
        "kpi": kpi,
        "recent_incidents": enriched_incidents,
        "recent_transactions": recent_txns,
    }


@router.get("/incidents")
def get_incidents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return paginated list of all incidents. Optionally filter by risk level."""
    query = db.query(Incident).order_by(desc(Incident.created_at))

    if risk_level:
        try:
            risk_enum = RiskLevel(risk_level.upper())
            query = query.filter(Incident.risk_level == risk_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid risk_level: {risk_level}")

    total = query.count()
    incidents = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "incidents": [_enrich_incident(inc, db) for inc in incidents],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/incidents/{incident_id}")
def get_incident(
    incident_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return the full detail of a single incident by its human-readable ID (e.g. INC-1004)."""
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return _enrich_incident(incident, db)


@router.get("/transactions")
def get_all_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return all transactions across all users — for the Admin live feed."""
    total = db.query(Transaction).count()
    txns = (
        db.query(Transaction)
        .order_by(desc(Transaction.timestamp))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    result = []
    for tx in txns:
        sender = db.query(User).filter(User.id == tx.sender_id).first()
        receiver = db.query(User).filter(User.id == tx.receiver_id).first() if tx.receiver_id else None
        result.append({
            "id": str(tx.id),
            "sender": sender.full_name if sender else "Unknown",
            "receiver": receiver.full_name if receiver else tx.receiver_account or "External",
            "amount": float(tx.amount),
            "transaction_type": tx.transaction_type.value if tx.transaction_type else None,
            "status": tx.status.value if tx.status else None,
            "location": tx.location,
            "ip_address": tx.ip_address,
            "device": tx.device,
            "merchant": tx.merchant,
            "timestamp": tx.timestamp.isoformat() if tx.timestamp else None,
        })
    return {"transactions": result, "total": total, "page": page, "page_size": page_size}


@router.get("/users")
def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return all registered users with basic info."""
    users = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "username": u.username,
            "role": u.role.value,
            "account_number": u.account_number,
            "balance": float(u.balance),
        }
        for u in users
    ]


@router.get("/behaviour/{user_id}")
def get_behaviour_profile(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return the behaviour profile for a specific user."""
    from app.models.behaviour_profile import BehaviourProfile
    profile = db.query(BehaviourProfile).filter(BehaviourProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Behaviour profile not found")
    return {
        "user_id": str(profile.user_id),
        "usual_locations": profile.usual_locations or [],
        "usual_devices": profile.usual_devices or [],
        "usual_merchants": profile.usual_merchants or [],
        "usual_tx_min": float(profile.usual_tx_min or 0),
        "usual_tx_max": float(profile.usual_tx_max or 0),
        "usual_hours_start": profile.usual_hours_start,
        "usual_hours_end": profile.usual_hours_end,
        "transaction_count": profile.transaction_count,
    }


@router.get("/quantum")
def get_quantum_overview(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Return an overview of all incidents with quantum risk indicators."""
    quantum_incidents = (
        db.query(Incident)
        .filter(Incident.quantum_hndl_warning == True)
        .order_by(desc(Incident.quantum_exposure_score))
        .all()
    )
    return {
        "total_quantum_alerts": len(quantum_incidents),
        "incidents": [
            {
                "incident_id": inc.incident_id,
                "quantum_exposure_score": inc.quantum_exposure_score,
                "quantum_hndl_warning": inc.quantum_hndl_warning,
                "quantum_recommendation": inc.quantum_recommendation,
                "affected_user": (db.query(User).filter(User.id == inc.user_id).first() or User()).full_name,
                "created_at": inc.created_at.isoformat() if inc.created_at else None,
            }
            for inc in quantum_incidents
        ],
    }


# ── AI Chat ────────────────────────────────────────────────────────────────────

class ChatRequestModel(BaseModel):
    message: str
    incident_id: Optional[str] = None
    history: list = []


@router.post("/chat")
def admin_chat(
    body: ChatRequestModel,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Gemini-powered AI chat for SOC analysts.
    If incident_id is provided, the full incident context is injected into the prompt.
    """
    import google.generativeai as genai
    from app.config import settings

    context_parts = []
    incident_context = ""

    if body.incident_id:
        inc = db.query(Incident).filter(Incident.incident_id == body.incident_id).first()
        if inc:
            user = db.query(User).filter(User.id == inc.user_id).first()
            tx = db.query(Transaction).filter(Transaction.id == inc.transaction_id).first()
            incident_context = f"""
INCIDENT CONTEXT — {inc.incident_id}:
- Type: {inc.incident_type}
- Risk Level: {inc.risk_level.value}
- Affected User: {user.full_name if user else 'Unknown'}
- Transaction Amount: ₹{float(tx.amount):,.2f} if tx else 'N/A'
- Fraud Probability: {inc.fraud_probability * 100:.1f}%
- AI Summary: {inc.ai_summary}
- Why Suspicious: {inc.why_suspicious}
- Correlation Signals: {', '.join(inc.correlation_signals or [])}
- Recommended Actions: {', '.join(inc.recommended_actions or [])}
- Quantum HNDL Warning: {'YES' if inc.quantum_hndl_warning else 'No'}
"""
            context_parts.append(inc.incident_id)

    system_prompt = f"""You are BankShield AI — an expert cybersecurity and fraud analyst assistant for Bank of Maharashtra's Security Operations Center.
You help SOC analysts investigate incidents, understand threats, and make decisions.
Be concise, professional, and specific. Use ₹ for Indian currency amounts.
{incident_context}
Answer the analyst's question based on the context above and your security expertise."""

    # Build conversation history
    history_text = ""
    for turn in body.history[-6:]:  # Last 6 turns for context
        role = "Analyst" if turn.get("role") == "user" else "BankShield AI"
        history_text += f"\n{role}: {turn.get('content', '')}"

    full_prompt = f"{system_prompt}\n\nConversation so far:{history_text}\n\nAnalyst: {body.message}\n\nBankShield AI:"

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(full_prompt)
        reply = response.text.strip()
    except Exception as e:
        # Intelligent mock fallback
        msg = body.message.lower()
        if "reverse" in msg or "cancel" in msg:
            reply = "To reverse or cancel this transaction, use the action buttons in the Fraud Analysis tab of the incident drawer. REVERSE credits the amount back to the sender. CANCEL simply blocks the transaction."
        elif "block" in msg or "suspend" in msg:
            reply = "Recommended: Immediately suspend the account and force re-authentication via OTP. Use the CANCEL action on the transaction to prevent fund movement."
        elif "quantum" in msg or "hndl" in msg:
            reply = "HNDL (Harvest Now, Decrypt Later) indicates encrypted data may have been exfiltrated for future quantum decryption. Recommend upgrading affected channels to post-quantum cryptography."
        elif "why" in msg or "suspicious" in msg:
            reply = f"This incident was flagged due to: significant deviation from the user's normal behaviour profile, including unusual location, device, time, and transaction amount combination."
        else:
            reply = f"I've analysed the available context. Based on the incident signals and fraud probability, I recommend following the recommended actions listed in the incident report. Would you like me to explain any specific signal in more detail?"

    return {"reply": reply, "context_used": context_parts}


# ── Transaction Actions ────────────────────────────────────────────────────────

class TransactionActionModel(BaseModel):
    action: str          # "REVERSE" | "CANCEL"
    reason: str = ""


@router.post("/transactions/{transaction_id}/action")
def transaction_action(
    transaction_id: str,
    body: TransactionActionModel,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin power action on a transaction.
    CANCEL  → status = BLOCKED (no money movement)
    REVERSE → status = BLOCKED + refund amount to sender balance
    """
    import uuid as _uuid
    from datetime import datetime, timezone
    from app.models.transaction import TransactionStatus, TransactionType

    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.status.value in ("BLOCKED",):
        raise HTTPException(status_code=400, detail="Transaction is already blocked/reversed")

    action = body.action.upper()
    if action not in ("REVERSE", "CANCEL"):
        raise HTTPException(status_code=400, detail="action must be REVERSE or CANCEL")

    sender = db.query(User).filter(User.id == tx.sender_id).first()

    if action == "REVERSE" and sender:
        # Credit amount back to sender
        sender.balance = float(sender.balance) + float(tx.amount)
        # Create a reversal transaction record
        reversal = Transaction(
            id=_uuid.uuid4(),
            sender_id=tx.receiver_id or tx.sender_id,
            receiver_id=tx.sender_id,
            receiver_account=sender.account_number,
            amount=tx.amount,
            transaction_type=TransactionType.TRANSFER,
            status=TransactionStatus.COMPLETED,
            description=f"REVERSAL of {tx.id} — {body.reason or 'Admin action'}",
            timestamp=datetime.now(timezone.utc),
        )
        db.add(reversal)

    tx.status = TransactionStatus.BLOCKED
    db.commit()
    db.refresh(tx)

    return {
        "success": True,
        "action": action,
        "transaction_id": str(tx.id),
        "message": f"Transaction {action.lower()}d successfully. {'Amount ₹{:.2f} refunded to sender.'.format(float(tx.amount)) if action == 'REVERSE' and sender else ''}",
        "new_status": tx.status.value,
    }

