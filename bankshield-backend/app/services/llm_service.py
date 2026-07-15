import logging
import json
from typing import Optional
from dataclasses import dataclass
from app.config import settings
from app.models.incident import RiskLevel

logger = logging.getLogger(__name__)


@dataclass
class LLMSummaryResult:
    incident_summary: str
    why_suspicious: str
    business_impact: str
    recommended_actions: list[str]


# ── Mock LLM Service ───────────────────────────────────────────────────────────
# Returns realistic investigation summaries when Gemini key is absent or fails.

def _mock_summary(
    incident_type: str,
    risk_level: RiskLevel,
    signals: list[str],
    transaction_amount: float,
    affected_user: str,
) -> LLMSummaryResult:
    """Realistic mock summaries keyed by incident type for demo purposes."""

    signal_text = "; ".join(signals[:3]) if signals else "multiple anomalous indicators"
    amount_str = f"₹{transaction_amount:,.2f}"

    templates = {
        "Account Takeover": LLMSummaryResult(
            incident_summary=(
                f"A {risk_level.value} severity account takeover attempt has been detected for user "
                f"{affected_user}. The threat actor appears to have gained unauthorised access using "
                f"compromised credentials, followed by immediate execution of a high-value transaction "
                f"of {amount_str}. Key indicators: {signal_text}."
            ),
            why_suspicious=(
                f"This transaction deviates significantly from {affected_user}'s established behaviour "
                f"profile. The combination of a new device, geographic anomaly, and transaction value "
                f"({amount_str}) that is multiple times the user's historical maximum are strong "
                f"indicators of an account takeover. The timing pattern is consistent with automated "
                f"credential exploitation."
            ),
            business_impact=(
                f"Immediate financial exposure of {amount_str}. If this transaction completes, "
                f"recovery is unlikely without intervention. Reputational risk to Bank of Maharashtra "
                f"if the account holder disputes the transaction. Regulatory notification may be "
                f"required under RBI fraud reporting guidelines within 24 hours."
            ),
            recommended_actions=[
                f"IMMEDIATE: Block the transaction of {amount_str} pending investigation",
                "IMMEDIATE: Suspend account and force re-authentication with OTP",
                "URGENT: Contact account holder via registered mobile number to confirm activity",
                "FOLLOW-UP: Perform full account audit for the past 30 days",
                "FOLLOW-UP: Initiate RBI fraud notification if confirmed",
            ],
        ),
        "Credential Stuffing": LLMSummaryResult(
            incident_summary=(
                f"A credential stuffing attack pattern has been detected on {affected_user}'s account. "
                f"Multiple failed authentication attempts were followed by a successful login and "
                f"an immediate high-value transaction of {amount_str}."
            ),
            why_suspicious=(
                f"The pattern of repeated failed logins followed by success is a classic signature "
                f"of automated credential stuffing tools. The immediate execution of a large transaction "
                f"({amount_str}) without normal user warm-up behaviour suggests malicious automation."
            ),
            business_impact=(
                f"Financial exposure of {amount_str}. This attack pattern suggests the attacker "
                f"obtained credentials from a third-party breach. Other accounts may be at risk."
            ),
            recommended_actions=[
                "IMMEDIATE: Block transaction and lock account",
                "IMMEDIATE: Force password reset for affected user",
                "URGENT: Scan for other accounts targeted in the same attack wave",
                "FOLLOW-UP: Implement CAPTCHA or rate limiting on login endpoint",
                "FOLLOW-UP: Notify user of potential credential exposure",
            ],
        ),
    }

    # Default template for unclassified types
    default = LLMSummaryResult(
        incident_summary=(
            f"A {risk_level.value} severity suspicious transaction of {amount_str} has been flagged "
            f"for user {affected_user}. Indicators: {signal_text}."
        ),
        why_suspicious=(
            f"This transaction triggered {len(signals)} correlation signals including deviations "
            f"from the user's established behaviour profile. The risk score exceeds the threshold "
            f"for {risk_level.value} classification."
        ),
        business_impact=(
            f"Potential financial exposure of {amount_str}. "
            f"Immediate review recommended to prevent loss."
        ),
        recommended_actions=[
            "Review transaction details with account holder",
            "Apply enhanced monitoring on this account",
            "Consider temporary transaction limit reduction",
        ],
    )

    return templates.get(incident_type, default)


# ── Gemini LLM Service ─────────────────────────────────────────────────────────

def _gemini_summary(
    incident_type: str,
    risk_level: RiskLevel,
    signals: list[str],
    transaction_amount: float,
    affected_user: str,
    fraud_probability: float,
) -> Optional[LLMSummaryResult]:
    """Call Google Gemini to generate an investigation summary. Returns None on failure."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-flash-latest")

        prompt = f"""You are a cybersecurity analyst at Bank of Maharashtra.
Analyse the following security incident and provide a structured investigation report.

INCIDENT DETAILS:
- Type: {incident_type}
- Risk Level: {risk_level.value}
- Affected User: {affected_user}
- Transaction Amount: ₹{transaction_amount:,.2f}
- Fraud Probability: {fraud_probability * 100:.1f}%
- Correlation Signals:
{chr(10).join(f"  • {s}" for s in signals)}

Respond ONLY with a valid JSON object in this exact format:
{{
  "incident_summary": "2-3 sentence summary of what happened",
  "why_suspicious": "2-3 sentences explaining why this is suspicious based on the signals",
  "business_impact": "1-2 sentences on financial and reputational impact",
  "recommended_actions": ["action 1", "action 2", "action 3", "action 4"]
}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        data = json.loads(text)
        return LLMSummaryResult(
            incident_summary=data.get("incident_summary", ""),
            why_suspicious=data.get("why_suspicious", ""),
            business_impact=data.get("business_impact", ""),
            recommended_actions=data.get("recommended_actions", []),
        )

    except Exception as e:
        logger.warning(f"Gemini API call failed: {e} — falling back to mock summary")
        return None


# ── Public Interface ───────────────────────────────────────────────────────────

def generate_summary(
    incident_type: str,
    risk_level: RiskLevel,
    signals: list[str],
    transaction_amount: float,
    affected_user: str,
    fraud_probability: float = 0.5,
) -> LLMSummaryResult:
    """
    Generate an AI investigation summary for MEDIUM, HIGH, and CRITICAL incidents.

    Uses Gemini if API key is configured, falls back to MockLLMService automatically.
    Always returns a valid result — never raises.
    """
    if not settings.use_mock_llm:
        result = _gemini_summary(
            incident_type, risk_level, signals,
            transaction_amount, affected_user, fraud_probability
        )
        if result:
            return result

    logger.info("Using MockLLMService for investigation summary")
    return _mock_summary(incident_type, risk_level, signals, transaction_amount, affected_user)
