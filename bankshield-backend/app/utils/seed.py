"""
Seed script for BankShield AI hackathon demo.

Creates:
  - 2 Admin users
  - 5 Regular users with realistic profiles
  - Behaviour profiles for all users
  - 30 historical transactions (to build baselines)
  - 3 pre-built incidents (MEDIUM, HIGH, CRITICAL) so the admin dashboard is never empty
  - Login history with one suspicious session for the demo user

Run:  python -m app.utils.seed
"""

import uuid
import random
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_engine
from app.models import (
    User, UserRole, LoginHistory, LoginStatus,
    Transaction, TransactionType, TransactionStatus,
    BehaviourProfile, Incident, RiskLevel
)
from app.database import Base
from app.utils.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_account_number(prefix: str = "MH") -> str:
    return prefix + str(random.randint(1000000000, 9999999999))


def seed_all():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=get_engine())

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            logger.info("Database already seeded. Skipping.")
            return

        # ── ADMIN USERS ────────────────────────────────────────────────────────
        admins = [
            User(
                id=uuid.uuid4(),
                full_name="BankShield Admin",
                email="admin@bankshield.ai",
                username="admin",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                account_number=generate_account_number("AD"),
                balance=0.00,
            ),
            User(
                id=uuid.uuid4(),
                full_name="Security Operations",
                email="soc@bankshield.ai",
                username="soc_admin",
                password_hash=hash_password("soc123"),
                role=UserRole.ADMIN,
                account_number=generate_account_number("AD"),
                balance=0.00,
            ),
        ]
        for a in admins:
            db.add(a)
        db.flush()
        logger.info(f"Created {len(admins)} admin users")

        # ── REGULAR USERS ──────────────────────────────────────────────────────
        users_data = [
            {
                "full_name": "Rahul Sharma",
                "email": "rahul.sharma@gmail.com",
                "username": "rahul_sharma",
                "password": "demo123",
                "balance": 10850000.00,
                # Normal behaviour profile
                "locations": ["Mumbai", "Pune"],
                "devices": ["Samsung Galaxy S23", "MacBook Pro"],
                "merchants": ["Amazon", "Flipkart", "BigBasket", "HDFC Credit"],
                "tx_min": 500.0,
                "tx_max": 35000.0,
                "hours_start": 9,
                "hours_end": 21,
            },
            {
                "full_name": "Priya Patel",
                "email": "priya.patel@gmail.com",
                "username": "priya_patel",
                "password": "demo123",
                "balance": 425000.00,
                "locations": ["Ahmedabad", "Surat"],
                "devices": ["iPhone 14", "iPad Pro"],
                "merchants": ["Swiggy", "Zomato", "Myntra", "PhonePe"],
                "tx_min": 200.0,
                "tx_max": 20000.0,
                "hours_start": 8,
                "hours_end": 22,
            },
            {
                "full_name": "Arjun Mehta",
                "email": "arjun.mehta@gmail.com",
                "username": "arjun_mehta",
                "password": "demo123",
                "balance": 1200000.00,
                "locations": ["Delhi", "Gurgaon", "Noida"],
                "devices": ["OnePlus 11", "Dell XPS"],
                "merchants": ["Paytm", "ICICI Bank", "Nykaa", "Amazon"],
                "tx_min": 1000.0,
                "tx_max": 80000.0,
                "hours_start": 7,
                "hours_end": 23,
            },
            {
                "full_name": "Sneha Kulkarni",
                "email": "sneha.kulkarni@gmail.com",
                "username": "sneha_kulkarni",
                "password": "demo123",
                "balance": 320000.00,
                "locations": ["Pune", "Nashik"],
                "devices": ["Realme 9", "Lenovo ThinkPad"],
                "merchants": ["BigBasket", "D-Mart", "Netflix", "Spotify"],
                "tx_min": 100.0,
                "tx_max": 15000.0,
                "hours_start": 10,
                "hours_end": 20,
            },
            {
                "full_name": "Vikram Singh",
                "email": "vikram.singh@gmail.com",
                "username": "vikram_singh",
                "password": "demo123",
                "balance": 675000.00,
                "locations": ["Bangalore", "Hyderabad"],
                "devices": ["Pixel 7", "HP EliteBook"],
                "merchants": ["Ola", "Uber", "MakeMyTrip", "BookMyShow"],
                "tx_min": 500.0,
                "tx_max": 50000.0,
                "hours_start": 9,
                "hours_end": 22,
            },
        ]

        created_users = []
        for ud in users_data:
            user = User(
                id=uuid.uuid4(),
                full_name=ud["full_name"],
                email=ud["email"],
                username=ud["username"],
                password_hash=hash_password(ud["password"]),
                role=UserRole.USER,
                account_number=generate_account_number(),
                balance=ud["balance"],
            )
            db.add(user)
            db.flush()

            # Create behaviour profile
            profile = BehaviourProfile(
                id=uuid.uuid4(),
                user_id=user.id,
                usual_locations=ud["locations"],
                usual_devices=ud["devices"],
                usual_merchants=ud["merchants"],
                usual_tx_min=ud["tx_min"],
                usual_tx_max=ud["tx_max"],
                usual_hours_start=ud["hours_start"],
                usual_hours_end=ud["hours_end"],
                transaction_count=30,
            )
            db.add(profile)

            created_users.append((user, ud))

        db.flush()
        logger.info(f"Created {len(created_users)} users with behaviour profiles")

        # ── LOGIN HISTORY ──────────────────────────────────────────────────────
        rahul = created_users[0][0]
        now = datetime.now(timezone.utc)

        # Normal logins for Rahul over past 7 days
        normal_logins = [
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(days=6),
                ip_address="103.21.58.10",
                device="Samsung Galaxy S23",
                browser="Chrome Mobile 118",
                location="Mumbai",
                login_status=LoginStatus.SUCCESS,
            ),
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(days=4),
                ip_address="103.21.58.10",
                device="Samsung Galaxy S23",
                browser="Chrome Mobile 118",
                location="Mumbai",
                login_status=LoginStatus.SUCCESS,
            ),
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(days=2),
                ip_address="103.21.58.10",
                device="MacBook Pro",
                browser="Safari 17",
                location="Mumbai",
                login_status=LoginStatus.SUCCESS,
            ),
        ]

        # Suspicious login for demo — different city, new device, 3AM
        suspicious_login = LoginHistory(
            id=uuid.uuid4(),
            user_id=rahul.id,
            login_time=now - timedelta(hours=3),
            ip_address="45.33.32.156",   # Different IP block
            device="iPhone 15 Pro",       # Unknown device
            browser="Safari Mobile 17",
            location="Delhi",             # Different city
            login_status=LoginStatus.SUCCESS,
            # Quantum indicators
            backup_download=True,
            encrypted_archive_download=True,
        )

        # Failed attempts before suspicious login (credential stuffing signal)
        failed_logins = [
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(hours=3, minutes=15),
                ip_address="45.33.32.156",
                device="iPhone 15 Pro",
                browser="Safari Mobile 17",
                location="Delhi",
                login_status=LoginStatus.FAILED,
            ),
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(hours=3, minutes=10),
                ip_address="45.33.32.156",
                device="iPhone 15 Pro",
                browser="Safari Mobile 17",
                location="Delhi",
                login_status=LoginStatus.FAILED,
            ),
            LoginHistory(
                id=uuid.uuid4(),
                user_id=rahul.id,
                login_time=now - timedelta(hours=3, minutes=5),
                ip_address="45.33.32.156",
                device="iPhone 15 Pro",
                browser="Safari Mobile 17",
                location="Delhi",
                login_status=LoginStatus.FAILED,
            ),
        ]

        for l in [*normal_logins, suspicious_login, *failed_logins]:
            db.add(l)

        logger.info("Created login history for demo user (Rahul Sharma)")

        # ── HISTORICAL TRANSACTIONS ────────────────────────────────────────────
        # Normal transactions across users to populate the dashboard
        user_list = [u for u, _ in created_users]
        merchants = ["Amazon", "BigBasket", "HDFC Credit", "Paytm", "Swiggy", "Zomato", "Netflix"]
        locations = ["Mumbai", "Delhi", "Bangalore", "Pune", "Ahmedabad"]
        devices = ["Samsung Galaxy S23", "iPhone 14", "OnePlus 11", "Pixel 7"]

        for i in range(30):
            sender = random.choice(user_list)
            receiver = random.choice([u for u in user_list if u.id != sender.id])
            amount = random.uniform(500, 30000)
            days_ago = random.randint(1, 30)
            hour = random.randint(9, 21)
            tx = Transaction(
                id=uuid.uuid4(),
                sender_id=sender.id,
                receiver_id=receiver.id,
                receiver_account=receiver.account_number,
                amount=round(amount, 2),
                merchant=random.choice(merchants),
                transaction_type=TransactionType.TRANSFER,
                timestamp=now - timedelta(days=days_ago, hours=random.randint(0, 23)),
                device=random.choice(devices),
                ip_address=f"103.21.{random.randint(10, 200)}.{random.randint(1, 254)}",
                location=random.choice(locations),
                status=TransactionStatus.COMPLETED,
            )
            db.add(tx)

        db.flush()
        logger.info("Created 30 historical transactions")

        # ── PRE-BUILT INCIDENTS ────────────────────────────────────────────────
        # These ensure the admin dashboard always has content on first load.
        rahul_user = rahul
        arjun_user = created_users[2][0]
        priya_user = created_users[1][0]

        # Find a historical transaction to attach to
        arjun_tx = db.query(Transaction).filter(Transaction.sender_id == arjun_user.id).first()
        priya_tx = db.query(Transaction).filter(Transaction.sender_id == priya_user.id).first()
        rahul_tx = db.query(Transaction).filter(Transaction.sender_id == rahul_user.id).first()

        pre_built_incidents = [
            Incident(
                id=uuid.uuid4(),
                incident_id="INC-1001",
                transaction_id=priya_tx.id if priya_tx else None,
                user_id=priya_user.id,
                incident_type="Off-Hours Transaction",
                risk_level=RiskLevel.MEDIUM,
                fraud_probability=0.42,
                fraud_confidence=0.71,
                fraud_reasons=["Transaction amount above typical threshold"],
                behaviour_deviation_score=45.0,
                overall_risk_score=44.5,
                correlation_signals=[
                    "Transaction at 02:15 — outside normal hours (08:00–22:00)",
                    "Transaction amount ₹18,500.00 is 1.2x above normal maximum",
                ],
                timeline=[
                    {"time": "01:55", "event": "✓ Login from Ahmedabad on iPhone 14", "category": "login"},
                    {"time": "02:15", "event": "₹18,500.00 TRANSFER from Ahmedabad via iPhone 14", "category": "transaction"},
                    {"time": "02:16", "event": "🟡 Incident INC-1001 created — MEDIUM risk", "category": "alert"},
                ],
                ai_summary="A medium-severity off-hours transaction of ₹18,500 was detected for Priya Patel at 2:15 AM, which falls outside her established activity window of 8 AM to 10 PM.",
                why_suspicious="The transaction occurred 4 hours outside the user's established activity pattern. While the amount is only slightly above the normal maximum, the combination of off-hours timing and marginally elevated amount warrants monitoring.",
                business_impact="Low immediate financial risk. Pattern monitoring recommended to distinguish genuine late-night activity from potential account misuse.",
                recommended_actions=["Monitor account for further off-hours activity", "Notify user of after-hours transaction via SMS"],
                quantum_exposure_score=0.0,
                quantum_hndl_warning=False,
                quantum_recommendation="No quantum risk indicators detected in recent session history.",
                created_at=now - timedelta(hours=48),
            ),
            Incident(
                id=uuid.uuid4(),
                incident_id="INC-1002",
                transaction_id=arjun_tx.id if arjun_tx else None,
                user_id=arjun_user.id,
                incident_type="Anomalous High-Value Transfer",
                risk_level=RiskLevel.HIGH,
                fraud_probability=0.74,
                fraud_confidence=0.82,
                fraud_reasons=[
                    "Transaction amount is significantly above historical average",
                    "Pattern similarity to high-value fraud clusters",
                ],
                behaviour_deviation_score=72.0,
                overall_risk_score=68.5,
                correlation_signals=[
                    "Transaction location 'Mumbai' not in known locations: Delhi, Gurgaon, Noida",
                    "Transaction amount ₹1,50,000.00 is 1.9x above normal maximum of ₹80,000.00",
                    "Device 'Redmi Note 12' — unknown device",
                ],
                timeline=[
                    {"time": "14:30", "event": "✓ Login from Mumbai on Redmi Note 12", "category": "login"},
                    {"time": "14:31", "event": "Device changed from 'OnePlus 11' to 'Redmi Note 12'", "category": "device"},
                    {"time": "14:45", "event": "₹1,50,000.00 TRANSFER from Mumbai via Redmi Note 12", "category": "transaction"},
                    {"time": "14:46", "event": "🟠 Incident INC-1002 created — HIGH risk", "category": "alert"},
                ],
                ai_summary="A high-severity anomalous transfer of ₹1,50,000 was detected for Arjun Mehta from an unknown device in Mumbai — a city not in his known location profile of Delhi, Gurgaon, and Noida.",
                why_suspicious="Three simultaneous anomalies: unknown device, unknown location, and transaction amount 1.9x above the user's historical maximum. The combination is consistent with account compromise following credential theft.",
                business_impact="Direct financial exposure of ₹1,50,000. If transaction completes to an external account, recovery probability is low without immediate intervention.",
                recommended_actions=[
                    "URGENT: Contact account holder to verify transaction",
                    "Apply temporary transaction hold pending verification",
                    "Flag account for enhanced 30-day monitoring",
                    "Initiate device review — revoke unknown device session",
                ],
                quantum_exposure_score=0.0,
                quantum_hndl_warning=False,
                quantum_recommendation="No quantum risk indicators detected in recent session history.",
                created_at=now - timedelta(hours=12),
            ),
            Incident(
                id=uuid.uuid4(),
                incident_id="INC-1003",
                transaction_id=rahul_tx.id if rahul_tx else None,
                user_id=rahul_user.id,
                incident_type="Account Takeover",
                risk_level=RiskLevel.CRITICAL,
                fraud_probability=0.91,
                fraud_confidence=0.88,
                fraud_reasons=[
                    "Transaction amount is in the top 1% of historical transactions",
                    "Large value transfer pattern matches known fraud clusters",
                    "Amount significantly exceeds user's historical average",
                ],
                behaviour_deviation_score=95.0,
                overall_risk_score=91.5,
                correlation_signals=[
                    "3 failed login attempts detected before this transaction",
                    "Device mismatch: logged in on 'Samsung Galaxy S23', transaction from 'iPhone 15 Pro'",
                    "IP address changed from 103.21.58.10 to 45.33.32.156",
                    "Geographic anomaly: last login from 'Mumbai', transaction from 'Delhi'",
                    "Transaction location 'Delhi' is not in known locations: Mumbai, Pune",
                    "Unknown device 'iPhone 15 Pro' — user usually transacts on: Samsung Galaxy S23, MacBook Pro",
                    "Transaction amount ₹9,00,000.00 is 25.7x above normal maximum of ₹35,000.00",
                    "Transaction at 03:00 — outside normal hours (09:00–21:00)",
                ],
                timeline=[
                    {"time": "00:42", "event": "✗ FAILED Login from Delhi on iPhone 15 Pro", "category": "login"},
                    {"time": "00:47", "event": "✗ FAILED Login from Delhi on iPhone 15 Pro", "category": "login"},
                    {"time": "00:52", "event": "✗ FAILED Login from Delhi on iPhone 15 Pro", "category": "login"},
                    {"time": "00:57", "event": "✓ Login from Delhi on iPhone 15 Pro", "category": "login"},
                    {"time": "00:58", "event": "Device changed from 'Samsung Galaxy S23' to 'iPhone 15 Pro'", "category": "device"},
                    {"time": "01:00", "event": "⚠ Account backup download initiated", "category": "quantum"},
                    {"time": "01:02", "event": "⚠ Encrypted archive download detected during session", "category": "quantum"},
                    {"time": "03:00", "event": "₹9,00,000.00 TRANSFER from Delhi via iPhone 15 Pro", "category": "transaction"},
                    {"time": "03:01", "event": "🔴 Incident INC-1003 created — CRITICAL risk", "category": "alert"},
                ],
                ai_summary="A CRITICAL severity account takeover has been detected for Rahul Sharma. The threat actor executed a credential stuffing attack with 3 failed logins, then gained access using a new device (iPhone 15 Pro) from Delhi — a city not in the user's profile. An encrypted backup download and archive export preceded a ₹9,00,000 high-value transfer at 3 AM.",
                why_suspicious="Eight simultaneous anomaly signals were detected: credential stuffing pattern, unknown device, IP change, geographic anomaly, behaviour deviation (new location + device), extreme amount (25.7x above normal), off-hours timing (3 AM), and quantum harvest indicators (backup + archive download). This is a textbook account takeover with possible HNDL data exfiltration.",
                business_impact="Immediate financial exposure of ₹9,00,000. Quantum harvest indicators suggest the attacker may have downloaded encrypted data for future decryption. Reputational risk and regulatory notification requirements apply. RBI incident reporting deadline: 6 hours from detection.",
                recommended_actions=[
                    "IMMEDIATE: Block transaction and freeze account",
                    "IMMEDIATE: Terminate all active sessions for Rahul Sharma",
                    "URGENT: Call registered mobile +91-XXXXXXXXXX to alert account holder",
                    "URGENT: File RBI fraud report within 6 hours",
                    "FOLLOW-UP: Full 90-day account audit",
                    "FOLLOW-UP: Initiate post-quantum cryptography review for exposed data",
                    "FOLLOW-UP: Coordinate with law enforcement if funds transferred externally",
                ],
                quantum_exposure_score=75.0,
                quantum_hndl_warning=True,
                quantum_recommendation="URGENT: Multiple quantum-harvest indicators detected. Suspend account pending review. Initiate post-quantum cryptography migration for this user's data assets.",
                created_at=now - timedelta(hours=2),
            ),
        ]

        for inc in pre_built_incidents:
            db.add(inc)

        db.commit()
        logger.info("Created 3 pre-built demo incidents (MEDIUM, HIGH, CRITICAL)")
        logger.info("=" * 60)
        logger.info("SEED COMPLETE")
        logger.info("=" * 60)
        logger.info("Admin login:   admin / admin123")
        logger.info("SOC login:     soc_admin / soc123")
        logger.info("User login:    rahul_sharma / demo123  (demo user)")
        logger.info("=" * 60)

    except Exception as e:
        db.rollback()
        logger.error(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
