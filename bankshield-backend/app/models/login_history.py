import uuid
from sqlalchemy import Column, String, Enum, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class LoginStatus(str, enum.Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    login_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    ip_address = Column(String(45), nullable=True)   # entity node: IP
    device = Column(String(255), nullable=True)       # entity node: Device
    browser = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)     # entity node: Location (city, country)
    login_status = Column(Enum(LoginStatus), nullable=False, default=LoginStatus.SUCCESS)

    # Prototype Quantum Risk Indicators
    # These simulate security telemetry events that could indicate
    # "Harvest Now, Decrypt Later" (HNDL) quantum risk behaviour.
    encrypted_archive_download = Column(Boolean, default=False)
    backup_download = Column(Boolean, default=False)
    certificate_export = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="login_history")

    def __repr__(self):
        return f"<LoginHistory user={self.user_id} status={self.login_status} time={self.login_time}>"
