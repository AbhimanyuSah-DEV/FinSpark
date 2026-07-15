import uuid
from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class BehaviourProfile(Base):
    """
    Lightweight user behaviour baseline built from historical transaction data.
    The Correlation Engine uses this to detect deviations without any ML.

    Example for User 1001 (normal pattern):
        usual_locations  = ["Mumbai", "Pune"]
        usual_devices    = ["Samsung Galaxy S23", "MacBook Pro"]
        usual_tx_min     = 500.00
        usual_tx_max     = 30000.00
        usual_merchants  = ["Amazon", "HDFC Credit", "BigBasket"]
        usual_hours_start = 9   (9 AM)
        usual_hours_end   = 20  (8 PM)
    """
    __tablename__ = "behaviour_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # JSON arrays of known values — stored as JSONB for efficient querying
    usual_locations = Column(JSONB, default=list)
    usual_devices = Column(JSONB, default=list)
    usual_merchants = Column(JSONB, default=list)

    # Amount range
    usual_tx_min = Column(Numeric(15, 2), default=0.00)
    usual_tx_max = Column(Numeric(15, 2), default=100000.00)

    # Typical activity hours (24h format)
    usual_hours_start = Column(Integer, default=8)    # 8 AM
    usual_hours_end = Column(Integer, default=22)     # 10 PM

    # Transaction count used to build this profile
    transaction_count = Column(Integer, default=0)

    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="behaviour_profile")

    def __repr__(self):
        return f"<BehaviourProfile user={self.user_id} locations={self.usual_locations}>"
