from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from app.models.incident import RiskLevel


# ── Timeline Event ─────────────────────────────────────────────────────────────

class TimelineEvent(BaseModel):
    time: str          # ISO string or formatted time
    event: str         # Human-readable description
    category: str      # "login" | "device" | "transaction" | "alert" | "quantum"


# ── Quantum Risk ───────────────────────────────────────────────────────────────

class QuantumRiskResult(BaseModel):
    quantum_exposure_score: float
    hndl_warning: bool
    recommendation: str
    indicators_detected: List[str]


# ── Fraud Model Result ─────────────────────────────────────────────────────────

class FraudModelResult(BaseModel):
    fraud_probability: float
    confidence: float
    reasons: List[str]


# ── Behaviour Deviation ────────────────────────────────────────────────────────

class BehaviourDeviationReport(BaseModel):
    location_deviation: bool
    device_deviation: bool
    amount_deviation: bool
    time_deviation: bool
    merchant_deviation: bool
    deviation_score: float   # 0–100
    deviation_details: List[str]


# ── Incident Schemas ───────────────────────────────────────────────────────────

class IncidentResponse(BaseModel):
    id: UUID
    incident_id: str
    transaction_id: Optional[UUID]
    user_id: UUID

    # Classification
    incident_type: str
    risk_level: RiskLevel
    overall_risk_score: Optional[float]

    # Fraud model
    fraud_probability: Optional[float]
    fraud_confidence: Optional[float]
    fraud_reasons: Optional[List[str]]

    # Correlation
    behaviour_deviation_score: Optional[float]
    correlation_signals: Optional[List[str]]

    # Timeline
    timeline: Optional[List[Any]]

    # LLM Summary
    ai_summary: Optional[str]
    why_suspicious: Optional[str]
    business_impact: Optional[str]
    recommended_actions: Optional[List[str]]

    # Quantum
    quantum_exposure_score: Optional[float]
    quantum_hndl_warning: Optional[bool]
    quantum_recommendation: Optional[str]

    created_at: datetime

    # Enriched fields (joined from other tables)
    affected_user: Optional[str] = None
    transaction_amount: Optional[float] = None

    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    incidents: List[IncidentResponse]
    total: int
    page: int
    page_size: int
