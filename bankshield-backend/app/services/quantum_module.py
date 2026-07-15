"""
Quantum Risk Module — BankShield AI
=====================================

HNDL (Harvest Now, Decrypt Later) Risk Assessment

This module evaluates the quantum cryptographic attack surface for a given
transaction. It does NOT assign random scores. Each risk point is grounded
in a concrete, explainable factor:

┌─────────────────────────────────────────────────────────────────────┐
│  FACTOR                          │  RATIONALE                        │
├─────────────────────────────────────────────────────────────────────┤
│  Transaction amount ≥ ₹5L        │  High-value transfers are the     │
│                                  │  prime HNDL harvesting targets.   │
│                                  │  Adversaries prioritise data that  │
│                                  │  will be worth decrypting later.   │
├─────────────────────────────────────────────────────────────────────┤
│  Transaction amount ≥ ₹1L        │  Medium-value indicator. Still    │
│                                  │  above average retail banking tx.  │
├─────────────────────────────────────────────────────────────────────┤
│  Account balance ≥ ₹10L          │  Wealthy accounts are HVTs        │
│                                  │  (High-Value Targets). Their       │
│                                  │  encrypted transaction data is     │
│                                  │  worth harvesting now.             │
├─────────────────────────────────────────────────────────────────────┤
│  Account balance ≥ ₹2L           │  Moderate HVT indicator.          │
├─────────────────────────────────────────────────────────────────────┤
│  Multiple device changes         │  Device hopping = possible MITM   │
│  in recent sessions              │  interception of encrypted         │
│                                  │  traffic. Each device change       │
│                                  │  represents a new encryption       │
│                                  │  channel that could be captured.   │
├─────────────────────────────────────────────────────────────────────┤
│  Multiple new-location logins    │  Geo-dispersed sessions suggest   │
│  across recent sessions          │  traffic is traversing multiple    │
│                                  │  untrusted networks — broader      │
│                                  │  quantum harvest surface.          │
├─────────────────────────────────────────────────────────────────────┤
│  Transaction risk is HIGH or     │  A transaction already flagged as  │
│  CRITICAL                        │  high-risk is more likely to be    │
│                                  │  linked to an active threat actor  │
│                                  │  who may already be capturing      │
│                                  │  encrypted session data.           │
└─────────────────────────────────────────────────────────────────────┘

HNDL Warning threshold: score ≥ 50
"""

from typing import List
from app.models.login_history import LoginHistory
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.incident import QuantumRiskResult


def assess_quantum_risk(
    login_history: List[LoginHistory],
    user: User,
    transaction: Transaction,
    risk_level_value: str,          # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
) -> QuantumRiskResult:
    """
    Compute a deterministic, explainable HNDL exposure score.
    Every point awarded has a specific reason recorded.
    """
    score = 0.0
    indicators: list[str] = []

    # ── Factor 1: Transaction amount ─────────────────────────────────────────
    amount = float(transaction.amount)
    if amount >= 500_000:           # ₹5L+
        score += 35
        indicators.append(
            f"High-value transfer of ₹{amount:,.0f} — a prime HNDL harvesting target; "
            "adversaries prioritise encrypting high-value financial data for future decryption."
        )
    elif amount >= 100_000:         # ₹1L–5L
        score += 15
        indicators.append(
            f"Above-average transaction amount of ₹{amount:,.0f} — moderately attractive "
            "target for encrypted data harvesting."
        )

    # ── Factor 2: Account balance (High-Value Target) ────────────────────────
    balance = float(user.balance)
    if balance >= 1_000_000:        # ₹10L+
        score += 30
        indicators.append(
            f"Account holds ₹{balance:,.0f} — classified as a High-Value Target (HVT). "
            "HVT accounts are preferentially harvested by quantum-capable adversaries."
        )
    elif balance >= 200_000:        # ₹2L–10L
        score += 10
        indicators.append(
            f"Account balance of ₹{balance:,.0f} — moderate HVT indicator; "
            "account is above the retail banking average."
        )

    # ── Factor 3: Device changes in recent sessions ──────────────────────────
    recent = login_history[:10]
    unique_devices = len(set(
        l.device for l in recent if l.device
    ))
    if unique_devices >= 3:
        score += 20
        indicators.append(
            f"{unique_devices} distinct devices used across recent sessions — "
            "each device represents a separate encrypted channel that could be "
            "intercepted and stored for later quantum decryption."
        )
    elif unique_devices == 2:
        score += 8
        indicators.append(
            "2 distinct devices detected across recent sessions — "
            "mild multi-channel exposure to encrypted traffic interception."
        )

    # ── Factor 4: Geographic dispersion ─────────────────────────────────────
    unique_locations = len(set(
        l.location for l in recent if l.location and l.location not in ("Unknown", "")
    ))
    if unique_locations >= 3:
        score += 15
        indicators.append(
            f"{unique_locations} different geographic locations across recent logins — "
            "traffic traversing multiple networks widens the quantum harvest surface."
        )

    # ── Factor 5: Transaction already flagged HIGH/CRITICAL ──────────────────
    if risk_level_value in ("HIGH", "CRITICAL"):
        score += 20
        indicators.append(
            f"Transaction flagged as {risk_level_value} risk — active threat actor involvement "
            "increases the likelihood that encrypted session data is already being captured "
            "for future quantum decryption."
        )

    # ── Clamp and derive warning ─────────────────────────────────────────────
    score = min(score, 100.0)
    hndl_warning = score >= 50

    # ── Recommendation ───────────────────────────────────────────────────────
    if score >= 75:
        recommendation = (
            "URGENT: High HNDL exposure detected. Recommend immediate migration to "
            "post-quantum cryptographic algorithms (CRYSTALS-Kyber / CRYSTALS-Dilithium) "
            "for this account's data channels. Suspend large outbound transfers pending review."
        )
    elif score >= 50:
        recommendation = (
            "WARNING: Elevated HNDL risk. Flag account for enhanced monitoring and "
            "initiate credential rotation. Evaluate transition to quantum-resistant "
            "TLS 1.3 cipher suites for this user's session traffic."
        )
    elif score >= 20:
        recommendation = (
            "ADVISORY: Low-level quantum exposure indicators present. "
            "Monitor account activity and review device usage patterns. "
            "No immediate action required."
        )
    else:
        recommendation = (
            "No significant HNDL indicators detected. Standard cryptographic "
            "controls are adequate for this transaction profile."
        )

    return QuantumRiskResult(
        quantum_exposure_score=round(score / 100, 4),   # normalise to 0–1 for DB
        hndl_warning=hndl_warning,
        recommendation=recommendation,
        indicators_detected=indicators,
    )
