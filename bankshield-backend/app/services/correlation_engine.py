from typing import List, Optional
from dataclasses import dataclass, field
from sqlalchemy.orm import Session
from app.models.login_history import LoginHistory
from app.models.transaction import Transaction
from app.schemas.incident import BehaviourDeviationReport


@dataclass
class CorrelationResult:
    """
    Output of the Correlation Engine — the hero of the Threat Intelligence Pipeline.
    Contains every signal that fired and the derived incident type.
    """
    signals: List[str] = field(default_factory=list)
    deviation_score: float = 0.0
    incident_type: str = "Suspicious Activity"
    device_changed: bool = False
    location_changed: bool = False
    ip_changed: bool = False
    recent_failed_logins: int = 0
    hours_since_last_login: Optional[float] = None


# ── Incident type classification rules ────────────────────────────────────────
# Applied in priority order — first matching rule wins.

INCIDENT_TYPE_RULES = [
    {
        "name": "Account Takeover",
        "conditions": lambda r: r.device_changed and r.location_changed and r.deviation_score >= 60,
    },
    {
        "name": "Credential Stuffing",
        "conditions": lambda r: r.recent_failed_logins >= 3,
    },
    {
        "name": "Session Hijacking",
        "conditions": lambda r: r.ip_changed and r.device_changed,
    },
    {
        "name": "Anomalous High-Value Transfer",
        "conditions": lambda r: r.deviation_score >= 50,
    },
    {
        "name": "Off-Hours Transaction",
        "conditions": lambda r: r.deviation_score > 0,
    },
]


def correlate(
    transaction: Transaction,
    behaviour_report: BehaviourDeviationReport,
    login_history: List[LoginHistory],
) -> CorrelationResult:
    """
    The Correlation Engine — the central orchestrator of the Threat Intelligence Pipeline.

    Cross-references:
      - Current transaction device/IP/location vs last login device/IP/location
      - Behaviour deviation report from BehaviourEngine
      - Recent failed login attempts
      - Time elapsed since last successful login

    Returns a CorrelationResult with all fired signals and a classified incident type.
    """
    result = CorrelationResult()
    signals = []

    # ── Pull last successful login ─────────────────────────────────────────────
    successful_logins = [l for l in login_history if l.login_status.value == "SUCCESS"]
    last_login = successful_logins[0] if successful_logins else None

    # Count recent failed logins (last 10 entries)
    recent_history = login_history[:10]
    failed_count = sum(1 for l in recent_history if l.login_status.value == "FAILED")
    result.recent_failed_logins = failed_count

    if failed_count >= 3:
        signals.append(f"{failed_count} failed login attempts detected before this transaction")

    # ── Device correlation ─────────────────────────────────────────────────────
    if last_login and transaction.device and last_login.device:
        if transaction.device.lower().strip() != last_login.device.lower().strip():
            result.device_changed = True
            signals.append(
                f"Device mismatch: logged in on '{last_login.device}', "
                f"transaction from '{transaction.device}'"
            )

    # ── IP correlation ─────────────────────────────────────────────────────────
    if last_login and transaction.ip_address and last_login.ip_address:
        if transaction.ip_address.strip() != last_login.ip_address.strip():
            result.ip_changed = True
            signals.append(
                f"IP address changed from {last_login.ip_address} to {transaction.ip_address}"
            )

    # ── Location correlation ───────────────────────────────────────────────────
    if last_login and transaction.location and last_login.location:
        login_city = last_login.location.split(",")[0].strip().lower()
        tx_city = transaction.location.split(",")[0].strip().lower()
        if login_city != tx_city:
            result.location_changed = True
            signals.append(
                f"Geographic anomaly: last login from '{last_login.location}', "
                f"transaction from '{transaction.location}'"
            )

    # ── Login recency ──────────────────────────────────────────────────────────
    if last_login and transaction.timestamp and last_login.login_time:
        from datetime import timezone
        tx_time = transaction.timestamp
        login_time = last_login.login_time
        # Ensure both are timezone-aware
        if tx_time.tzinfo is None:
            from datetime import timezone
            tx_time = tx_time.replace(tzinfo=timezone.utc)
        if login_time.tzinfo is None:
            login_time = login_time.replace(tzinfo=timezone.utc)
        delta = tx_time - login_time
        hours = delta.total_seconds() / 3600
        result.hours_since_last_login = round(hours, 2)
        if hours > 24:
            signals.append(f"Transaction initiated {round(hours)}h after last login — unusual gap")

    # ── Behaviour deviation signals ────────────────────────────────────────────
    signals.extend(behaviour_report.deviation_details)
    result.deviation_score = behaviour_report.deviation_score

    # ── Classify incident type ─────────────────────────────────────────────────
    for rule in INCIDENT_TYPE_RULES:
        if rule["conditions"](result):
            result.incident_type = rule["name"]
            break

    result.signals = signals
    return result
