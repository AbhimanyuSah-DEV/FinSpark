import uuid
import random
import logging
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.login_history import LoginHistory
from app.models.incident import Incident, RiskLevel
from app.models.user import User
from app.schemas.incident import (
    BehaviourDeviationReport,
    FraudModelResult,
    QuantumRiskResult,
)
from app.services.correlation_engine import CorrelationResult
from app.services.llm_service import LLMSummaryResult

logger = logging.getLogger(__name__)

# Incident ID counter stored in module scope — works fine for single-process Render deployment.
# For multi-process, use a DB sequence instead.
_INCIDENT_COUNTER_SEED = random.randint(1000, 1099)


def _generate_incident_id(db: Session) -> str:
    """Generate a human-readable incident ID like INC-1047."""
    count = db.query(Incident).count()
    return f"INC-{_INCIDENT_COUNTER_SEED + count + 1}"


def build_and_save_incident(
    transaction: Transaction,
    user: User,
    behaviour_report: BehaviourDeviationReport,
    correlation_result: CorrelationResult,
    fraud_result: FraudModelResult,
    risk_level: RiskLevel,
    overall_risk_score: float,
    timeline: List[dict],
    quantum_result: QuantumRiskResult,
    llm_result: LLMSummaryResult,
    db: Session,
) -> Incident:
    """
    Assembles and persists the full Incident object — the canonical intelligence output.

    This is the final step in the Threat Intelligence Pipeline.
    The Admin Dashboard renders incidents, not raw alerts.
    """
    incident_id = _generate_incident_id(db)

    incident = Incident(
        id=uuid.uuid4(),
        incident_id=incident_id,
        transaction_id=transaction.id,
        user_id=user.id,

        # Classification
        incident_type=correlation_result.incident_type,
        risk_level=risk_level,
        overall_risk_score=overall_risk_score,

        # Fraud model outputs
        fraud_probability=fraud_result.fraud_probability,
        fraud_confidence=fraud_result.confidence,
        fraud_reasons=fraud_result.reasons,

        # Correlation engine outputs
        behaviour_deviation_score=behaviour_report.deviation_score,
        correlation_signals=correlation_result.signals,

        # Timeline
        timeline=timeline,

        # LLM investigation summary
        ai_summary=llm_result.incident_summary,
        why_suspicious=llm_result.why_suspicious,
        business_impact=llm_result.business_impact,
        recommended_actions=llm_result.recommended_actions,

        # Quantum risk
        quantum_exposure_score=quantum_result.quantum_exposure_score,
        quantum_hndl_warning=quantum_result.hndl_warning,
        quantum_recommendation=quantum_result.recommendation,

        created_at=datetime.now(timezone.utc),
    )

    db.add(incident)

    # Update transaction status based on risk
    if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        transaction.status = "FLAGGED"
    else:
        transaction.status = "COMPLETED"

    db.commit()
    db.refresh(incident)

    logger.info(f"Incident {incident_id} created — risk={risk_level.value} score={overall_risk_score}")
    return incident
