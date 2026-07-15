import httpx
import logging
from typing import Optional
from app.config import settings
from app.schemas.incident import FraudModelResult
from app.models.transaction import Transaction

logger = logging.getLogger(__name__)

# ── Mock Implementation ────────────────────────────────────────────────────────
# Used when FRAUD_MODEL_URL=mock or the real endpoint is unavailable.
# Produces realistic results based on transaction amount to support demos.

def _mock_predict(transaction: Transaction) -> FraudModelResult:
    """
    Mock fraud prediction based on transaction amount tiers.
    Realistic enough for demo purposes. Replace with real model call when deployed.
    """
    amount = float(transaction.amount)

    if amount >= 500000:   # ≥ ₹5 Lakh
        return FraudModelResult(
            fraud_probability=0.91,
            confidence=0.88,
            reasons=[
                "Transaction amount is in the top 1% of historical transactions",
                "Large value transfer pattern matches known fraud clusters",
                "Amount significantly exceeds user's historical average",
            ],
        )
    elif amount >= 100000:  # ≥ ₹1 Lakh
        return FraudModelResult(
            fraud_probability=0.67,
            confidence=0.75,
            reasons=[
                "High-value transaction exceeds normal threshold",
                "Pattern similarity to structured fraud cases",
            ],
        )
    elif amount >= 30000:   # ≥ ₹30k
        return FraudModelResult(
            fraud_probability=0.34,
            confidence=0.70,
            reasons=[
                "Transaction amount above typical user behaviour",
            ],
        )
    else:
        return FraudModelResult(
            fraud_probability=0.08,
            confidence=0.92,
            reasons=[],
        )


# ── Real Implementation ────────────────────────────────────────────────────────

def _real_predict(transaction: Transaction) -> Optional[FraudModelResult]:
    """
    Calls the deployed Render fraud model endpoint.
    Returns None on any failure — caller should fall back to mock.
    """
    payload = {
        "amount": float(transaction.amount),
        "transaction_type": transaction.transaction_type.value if transaction.transaction_type else "TRANSFER",
        "device": transaction.device,
        "location": transaction.location,
        "ip_address": transaction.ip_address,
        "merchant": transaction.merchant,
        "timestamp": transaction.timestamp.isoformat() if transaction.timestamp else None,
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(f"{settings.fraud_model_url}/predict", json=payload)
            response.raise_for_status()
            data = response.json()
            return FraudModelResult(
                fraud_probability=data.get("fraud_probability", 0.5),
                confidence=data.get("confidence", 0.5),
                reasons=data.get("reasons", []),
            )
    except httpx.TimeoutException:
        logger.warning("Fraud model timed out — using mock fallback")
    except httpx.HTTPStatusError as e:
        logger.warning(f"Fraud model returned HTTP {e.response.status_code} — using mock fallback")
    except Exception as e:
        logger.warning(f"Fraud model error: {e} — using mock fallback")

    return None


# ── Public Interface ───────────────────────────────────────────────────────────

def get_fraud_prediction(transaction: Transaction) -> FraudModelResult:
    """
    Main entry point for fraud prediction.
    Switches between mock and real implementation based on config.
    Always returns a valid FraudModelResult — never raises.
    """
    if settings.use_mock_fraud:
        logger.info("Using mock fraud client (FRAUD_MODEL_URL=mock)")
        return _mock_predict(transaction)

    result = _real_predict(transaction)
    if result is None:
        logger.info("Real fraud model unavailable — falling back to mock")
        return _mock_predict(transaction)

    return result
