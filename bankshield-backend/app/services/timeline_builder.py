from typing import List
from datetime import datetime, timezone
from app.models.login_history import LoginHistory
from app.models.transaction import Transaction
from app.models.incident import RiskLevel
from app.schemas.incident import TimelineEvent


def build_timeline(
    transaction: Transaction,
    login_history: List[LoginHistory],
    risk_level: RiskLevel,
    incident_id: str,
) -> List[dict]:
    """
    Assemble a chronological timeline of security events from raw data.

    The frontend receives this as a JSON array and renders it directly —
    no business logic on the frontend side.

    Each event is a dict:
        { "time": "HH:MM", "event": "...", "category": "..." }

    Categories: login | device | transaction | alert | quantum
    """
    events: List[TimelineEvent] = []

    # ── Add login events ───────────────────────────────────────────────────────
    for login in reversed(login_history[-5:]):  # last 5 logins, oldest first
        login_time = login.login_time
        if login_time.tzinfo is None:
            login_time = login_time.replace(tzinfo=timezone.utc)

        status_label = "✓" if login.login_status.value == "SUCCESS" else "✗ FAILED"
        location_info = f" from {login.location}" if login.location else ""
        device_info = f" on {login.device}" if login.device else ""

        events.append(TimelineEvent(
            time=login_time.strftime("%H:%M"),
            event=f"Login {status_label}{location_info}{device_info}",
            category="login",
        ))

        # Quantum indicators
        if login.encrypted_archive_download:
            events.append(TimelineEvent(
                time=login_time.strftime("%H:%M"),
                event="⚠ Encrypted archive download detected during session",
                category="quantum",
            ))
        if login.backup_download:
            events.append(TimelineEvent(
                time=login_time.strftime("%H:%M"),
                event="⚠ Account backup download initiated",
                category="quantum",
            ))
        if login.certificate_export:
            events.append(TimelineEvent(
                time=login_time.strftime("%H:%M"),
                event="⚠ Certificate/key export detected",
                category="quantum",
            ))

    # ── Device change event ────────────────────────────────────────────────────
    if len(login_history) >= 2:
        last_login = login_history[0]
        prev_login = login_history[1]
        if (last_login.device and prev_login.device and
                last_login.device.lower() != prev_login.device.lower()):
            login_time = last_login.login_time
            if login_time.tzinfo is None:
                login_time = login_time.replace(tzinfo=timezone.utc)
            events.append(TimelineEvent(
                time=login_time.strftime("%H:%M"),
                event=f"Device changed from '{prev_login.device}' to '{last_login.device}'",
                category="device",
            ))

    # ── Transaction event ──────────────────────────────────────────────────────
    tx_time = transaction.timestamp
    if tx_time:
        if tx_time.tzinfo is None:
            tx_time = tx_time.replace(tzinfo=timezone.utc)
        amount_str = f"₹{float(transaction.amount):,.2f}"
        location_info = f" from {transaction.location}" if transaction.location else ""
        device_info = f" via {transaction.device}" if transaction.device else ""
        events.append(TimelineEvent(
            time=tx_time.strftime("%H:%M"),
            event=f"{amount_str} {transaction.transaction_type.value if transaction.transaction_type else 'transfer'}"
                  f"{location_info}{device_info}",
            category="transaction",
        ))

    # ── Alert/Incident creation event ─────────────────────────────────────────
    now_time = datetime.now(timezone.utc)
    risk_emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(risk_level.value, "⚪")
    events.append(TimelineEvent(
        time=now_time.strftime("%H:%M"),
        event=f"{risk_emoji} Incident {incident_id} created — {risk_level.value} risk",
        category="alert",
    ))

    # Sort all events by time string (HH:MM) — simple lexicographic sort works for same-day
    events.sort(key=lambda e: e.time)

    return [{"time": e.time, "event": e.event, "category": e.category} for e in events]
