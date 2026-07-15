import uuid
from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    TRANSFER = "TRANSFER"
    PAYMENT = "PAYMENT"
    WITHDRAWAL = "WITHDRAWAL"


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FLAGGED = "FLAGGED"
    BLOCKED = "BLOCKED"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    receiver_account = Column(String(20), nullable=True)   # for external transfers
    amount = Column(Numeric(15, 2), nullable=False)
    merchant = Column(String(255), nullable=True)          # entity node: Merchant
    transaction_type = Column(Enum(TransactionType), nullable=False, default=TransactionType.TRANSFER)
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    device = Column(String(255), nullable=True)            # entity node: Device
    ip_address = Column(String(45), nullable=True)         # entity node: IP
    location = Column(String(255), nullable=True)          # entity node: Location
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING)
    description = Column(String(500), nullable=True)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_transactions")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_transactions")
    incident = relationship("Incident", back_populates="transaction", uselist=False)

    def __repr__(self):
        return f"<Transaction {self.id} amount={self.amount} status={self.status}>"
