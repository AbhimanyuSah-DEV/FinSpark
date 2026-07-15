from pydantic import BaseModel
from typing import List, Optional
from app.schemas.transaction import TransactionResponse
from app.schemas.incident import IncidentResponse


class UserDashboardResponse(BaseModel):
    """Response for the regular User's dashboard."""
    full_name: str
    account_number: str
    balance: float
    recent_transactions: List[TransactionResponse]
    total_transactions: int


class AdminKPIStats(BaseModel):
    total_transactions: int
    total_incidents: int
    critical_incidents: int
    high_incidents: int
    medium_incidents: int
    low_incidents: int
    fraud_rate: float             # percentage of flagged transactions
    avg_fraud_probability: float
    quantum_alerts: int           # incidents with quantum_hndl_warning=True


class AdminDashboardResponse(BaseModel):
    """Response for the Admin SOC Dashboard — KPIs + recent activity."""
    kpi: AdminKPIStats
    recent_incidents: List[IncidentResponse]
    recent_transactions: List[dict]


class BehaviourProfileResponse(BaseModel):
    user_id: str
    usual_locations: List[str]
    usual_devices: List[str]
    usual_merchants: List[str]
    usual_tx_min: float
    usual_tx_max: float
    usual_hours_start: int
    usual_hours_end: int
    transaction_count: int
