from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.transaction import TransactionType, TransactionStatus


# ── Request Schemas ────────────────────────────────────────────────────────────

class TransferRequest(BaseModel):
    """
    Initiates a money transfer. Cybersecurity telemetry fields (device, ip, location)
    are captured here and fed into the Threat Intelligence Pipeline.
    """
    receiver_account: str = Field(..., description="Destination account number")
    amount: float = Field(..., gt=0, description="Amount in INR")
    description: Optional[str] = None
    transaction_type: TransactionType = TransactionType.TRANSFER
    merchant: Optional[str] = None
    password: str = Field(..., description="User password for verification")

    # Telemetry — sent by frontend from browser/device context
    device: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None


# ── Response Schemas ───────────────────────────────────────────────────────────

class TransactionResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: Optional[UUID]
    receiver_account: Optional[str]
    amount: float
    merchant: Optional[str]
    transaction_type: TransactionType
    timestamp: datetime
    device: Optional[str]
    ip_address: Optional[str]
    location: Optional[str]
    status: TransactionStatus
    description: Optional[str]

    class Config:
        from_attributes = True


class TransactionWithSenderName(TransactionResponse):
    """Extended response that includes sender/receiver names for the Admin dashboard."""
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
