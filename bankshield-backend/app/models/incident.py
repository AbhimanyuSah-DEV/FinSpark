import uuid
from sqlalchemy import Column, String, Float, Boolean, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Incident(Base):
    """
    The central intelligence object of BankShield AI.

    An Incident is NOT a simple alert. It is a fully correlated, AI-explained
    security event that contains:
        - The triggering transaction
        - All correlation signals that fired
        - Behaviour deviation analysis
        - A generated timeline of events
        - LLM-generated investigation summary
        - Quantum risk assessment
        - Recommended actions

    The Admin Dashboard renders incidents, not raw alerts.
    """
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(String(20), unique=True, nullable=False, index=True)  # e.g. INC-1004
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Classification
    incident_type = Column(String(100), nullable=False, default="Suspicious Activity")
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.LOW)

    # Fraud model output
    fraud_probability = Column(Float, nullable=True)
    fraud_confidence = Column(Float, nullable=True)
    fraud_reasons = Column(JSONB, default=list)       # reasons from fraud model

    # Correlation engine output
    behaviour_deviation_score = Column(Float, nullable=True)
    correlation_signals = Column(JSONB, default=list) # list of signal strings
    overall_risk_score = Column(Float, nullable=True)  # 0–100 numeric

    # Timeline — ordered list of {time, event} dicts
    timeline = Column(JSONB, default=list)

    # LLM Investigation Summary (generated for MEDIUM, HIGH, CRITICAL)
    ai_summary = Column(Text, nullable=True)
    why_suspicious = Column(Text, nullable=True)
    business_impact = Column(Text, nullable=True)
    recommended_actions = Column(JSONB, default=list)

    # Quantum Risk (prototype indicators)
    quantum_exposure_score = Column(Float, nullable=True)
    quantum_hndl_warning = Column(Boolean, default=False)
    quantum_recommendation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transaction = relationship("Transaction", back_populates="incident")
    user = relationship("User", back_populates="incidents")

    def __repr__(self):
        return f"<Incident {self.incident_id} risk={self.risk_level}>"
