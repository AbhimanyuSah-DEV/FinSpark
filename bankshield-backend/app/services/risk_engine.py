from app.schemas.incident import BehaviourDeviationReport, FraudModelResult
from app.services.correlation_engine import CorrelationResult
from app.models.incident import RiskLevel


# ── Weight Configuration ───────────────────────────────────────────────────────
# Adjust weights here without touching business logic.

WEIGHTS = {
    "fraud_probability": 0.40,
    "behaviour_deviation": 0.25,
    "correlation_signals": 0.20,
    "transaction_amount": 0.10,
    "failed_logins": 0.05,
}

# Amount thresholds for the amount contribution (INR)
AMOUNT_THRESHOLDS = [
    (1_000_000, 100),   # ≥ ₹10L → full 100
    (500_000, 80),      # ≥ ₹5L  → 80
    (100_000, 50),      # ≥ ₹1L  → 50
    (30_000, 20),       # ≥ ₹30k → 20
    (0, 5),             # default → 5
]


def _amount_score(amount: float) -> float:
    """Convert rupee amount to a 0–100 sub-score."""
    for threshold, score in AMOUNT_THRESHOLDS:
        if amount >= threshold:
            return float(score)
    return 5.0


def _failed_login_score(count: int) -> float:
    """Convert failed login count to a 0–100 sub-score."""
    if count >= 5:
        return 100.0
    return min(count * 20.0, 100.0)


def _signals_score(signal_count: int) -> float:
    """Convert number of correlation signals to a 0–100 sub-score."""
    return min(signal_count * 20.0, 100.0)


def compute_risk(
    fraud_result: FraudModelResult,
    behaviour_report: BehaviourDeviationReport,
    correlation_result: CorrelationResult,
    transaction_amount: float,
) -> tuple[RiskLevel, float]:
    """
    Compute the final risk level using a weighted scoring formula.

    Returns:
        (RiskLevel, overall_score_0_to_100)

    Score bands:
        0–39  → LOW
        40–59 → MEDIUM
        60–79 → HIGH
        80–100 → CRITICAL
    """
    fraud_sub = fraud_result.fraud_probability * 100
    behaviour_sub = behaviour_report.deviation_score
    signals_sub = _signals_score(len(correlation_result.signals))
    amount_sub = _amount_score(transaction_amount)
    login_sub = _failed_login_score(correlation_result.recent_failed_logins)

    overall = (
        fraud_sub * WEIGHTS["fraud_probability"]
        + behaviour_sub * WEIGHTS["behaviour_deviation"]
        + signals_sub * WEIGHTS["correlation_signals"]
        + amount_sub * WEIGHTS["transaction_amount"]
        + login_sub * WEIGHTS["failed_logins"]
    )

    overall = round(min(overall, 100.0), 2)

    if overall >= 80:
        level = RiskLevel.CRITICAL
    elif overall >= 60:
        level = RiskLevel.HIGH
    elif overall >= 40:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.LOW

    return level, overall
