from typing import Optional
from sqlalchemy.orm import Session
from app.models.behaviour_profile import BehaviourProfile
from app.models.transaction import Transaction
from app.schemas.incident import BehaviourDeviationReport
from uuid import UUID
from datetime import datetime


def get_or_create_profile(user_id: UUID, db: Session) -> BehaviourProfile:
    """Fetch existing profile or create an empty one for new users."""
    profile = db.query(BehaviourProfile).filter(BehaviourProfile.user_id == user_id).first()
    if not profile:
        profile = BehaviourProfile(
            user_id=user_id,
            usual_locations=[],
            usual_devices=[],
            usual_merchants=[],
            usual_tx_min=0.0,
            usual_tx_max=100000.0,
            usual_hours_start=8,
            usual_hours_end=22,
            transaction_count=0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def analyse_deviation(
    profile: BehaviourProfile,
    transaction: Transaction,
) -> BehaviourDeviationReport:
    """
    Compare a transaction against the user's behaviour profile and return
    a structured deviation report. No ML — pure rule-based comparison.

    Scoring logic (each flag contributes to total deviation score):
        Location deviation  → +30 points
        Device deviation    → +25 points
        Amount deviation    → +25 points
        Time deviation      → +10 points
        Merchant deviation  → +10 points
    """
    deviation_details = []
    score = 0.0

    # ── Location deviation ─────────────────────────────────────────────────────
    location_dev = False
    if transaction.location and profile.usual_locations:
        known_locations = [loc.lower().strip() for loc in (profile.usual_locations or [])]
        current_location = transaction.location.lower().strip()
        if current_location not in known_locations:
            location_dev = True
            score += 30
            deviation_details.append(
                f"Transaction location '{transaction.location}' is not in known locations: "
                f"{', '.join(profile.usual_locations)}"
            )

    # ── Device deviation ───────────────────────────────────────────────────────
    device_dev = False
    if transaction.device and profile.usual_devices:
        known_devices = [d.lower().strip() for d in (profile.usual_devices or [])]
        current_device = transaction.device.lower().strip()
        if current_device not in known_devices:
            device_dev = True
            score += 25
            deviation_details.append(
                f"Unknown device '{transaction.device}' — user usually transacts on: "
                f"{', '.join(profile.usual_devices)}"
            )

    # ── Amount deviation ───────────────────────────────────────────────────────
    amount_dev = False
    tx_amount = float(transaction.amount)
    profile_min = float(profile.usual_tx_min or 0)
    profile_max = float(profile.usual_tx_max or 100000)
    if tx_amount > profile_max:
        amount_dev = True
        score += 25
        multiplier = round(tx_amount / profile_max, 1) if profile_max > 0 else "∞"
        deviation_details.append(
            f"Transaction amount ₹{tx_amount:,.2f} is {multiplier}x above normal "
            f"maximum of ₹{profile_max:,.2f}"
        )
    elif tx_amount < profile_min and profile_min > 0:
        amount_dev = True
        score += 5
        deviation_details.append(
            f"Transaction amount ₹{tx_amount:,.2f} is below normal minimum of ₹{profile_min:,.2f}"
        )

    # ── Time deviation ─────────────────────────────────────────────────────────
    time_dev = False
    tx_hour = transaction.timestamp.hour if transaction.timestamp else datetime.now().hour
    hour_start = profile.usual_hours_start or 8
    hour_end = profile.usual_hours_end or 22
    if not (hour_start <= tx_hour <= hour_end):
        time_dev = True
        score += 10
        deviation_details.append(
            f"Transaction at {tx_hour:02d}:00 is outside normal hours "
            f"({hour_start:02d}:00–{hour_end:02d}:00)"
        )

    # ── Merchant deviation ─────────────────────────────────────────────────────
    merchant_dev = False
    if transaction.merchant and profile.usual_merchants:
        known_merchants = [m.lower().strip() for m in (profile.usual_merchants or [])]
        if transaction.merchant.lower().strip() not in known_merchants:
            merchant_dev = True
            score += 10
            deviation_details.append(
                f"Merchant '{transaction.merchant}' is not in known merchants"
            )

    return BehaviourDeviationReport(
        location_deviation=location_dev,
        device_deviation=device_dev,
        amount_deviation=amount_dev,
        time_deviation=time_dev,
        merchant_deviation=merchant_dev,
        deviation_score=min(score, 100.0),
        deviation_details=deviation_details,
    )


def update_profile_incrementally(
    profile: BehaviourProfile,
    transaction: Transaction,
    db: Session,
    risk_level: str = "LOW",
) -> None:
    """
    Incrementally update the behaviour profile after each LOW-risk transaction.
    HIGH/CRITICAL transactions are excluded to avoid polluting the baseline.
    """
    if risk_level in ("HIGH", "CRITICAL"):
        return

    count = (profile.transaction_count or 0) + 1

    # Update known locations
    locations = list(profile.usual_locations or [])
    if transaction.location and transaction.location not in locations:
        locations.append(transaction.location)
        profile.usual_locations = locations[:10]  # cap at 10 known locations

    # Update known devices
    devices = list(profile.usual_devices or [])
    if transaction.device and transaction.device not in devices:
        devices.append(transaction.device)
        profile.usual_devices = devices[:10]

    # Update known merchants
    merchants = list(profile.usual_merchants or [])
    if transaction.merchant and transaction.merchant not in merchants:
        merchants.append(transaction.merchant)
        profile.usual_merchants = merchants[:20]

    # Update amount range (rolling min/max)
    tx_amount = float(transaction.amount)
    if count <= 1:
        profile.usual_tx_min = tx_amount
        profile.usual_tx_max = tx_amount
    else:
        profile.usual_tx_min = min(float(profile.usual_tx_min or tx_amount), tx_amount)
        profile.usual_tx_max = max(float(profile.usual_tx_max or tx_amount), tx_amount)

    profile.transaction_count = count
    db.commit()
