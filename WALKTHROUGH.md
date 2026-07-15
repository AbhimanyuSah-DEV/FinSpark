# BankShield AI — Project Walkthrough

> A complete guide to understanding, running, and demonstrating the BankShield AI platform.

---

## 🗺️ What Was Built

BankShield AI is a full-stack **cyber-financial threat intelligence platform** built for Bank of Maharashtra. It solves the core problem that traditional fraud detection is reactive — it catches fraud *after* money is already lost.

The system correlates **cybersecurity telemetry** (logins, device changes, IP anomalies, geolocation) with **transactional behaviour** in real-time, running every transfer through an 8-stage AI pipeline powered by Google Gemini to produce an explainable risk verdict.

---

## 🏛️ System Architecture

```
Customer / Admin Browser
        │
        │  HTTPS (JWT Bearer Token)
        ▼
┌──────────────────────────────────┐
│   React Frontend (Vercel)        │
│   https://fin-spark.vercel.app   │
└──────────────┬───────────────────┘
               │  REST API calls
               ▼
┌──────────────────────────────────────────┐
│   FastAPI Backend — BrainCore Engine     │
│   https://finspark-gzwm.onrender.com     │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  /auth   │ │  /user   │ │  /admin  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┬─────────────┐
    ▼             ▼             ▼
PostgreSQL    Gemini AI     ipapi.co
(Neon Cloud)  Flash LLM     (Geo/IP)
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Customer | `rahul_sharma` | `demo123` |
| Customer | `priya_patel` | `demo123` |
| Customer | `amit_verma` | `demo123` |
| Admin SOC | `admin` | `admin123` |

---

## 🎬 Demo Walkthrough — Step by Step

### Step 1 — Landing Page
Navigate to the app. The landing page explains the problem BankShield solves:
- **"Traditional Security Is Reactive. We Are Predictive."**
- Shows the 8-stage BrainCore AI pipeline
- Highlights key features: Behaviour Profiling, Explainable AI, Threat Intelligence

### Step 2 — Customer Login
1. Click **Customer Login**
2. Use credentials: `rahul_sharma` / `demo123`
3. You land on the **Customer Dashboard** showing:
   - Live account balance (updates after every transaction)
   - Recent transaction history with risk badges
   - Security status widget

### Step 3 — Perform a High-Risk Transfer
This is the centrepiece of the demo:
1. The **Transfer Money** form is open at the top of the dashboard
2. Fill in:
   - **Receiver Account:** `ACC-20250002`
   - **Amount:** `800000` (₹8,00,000 — a large, suspicious amount)
   - **Transaction Type:** Transfer
   - **Security Password:** `demo123`
3. Click **Initiate Transfer**
4. A loading spinner appears while BrainCore runs the 8-stage pipeline in the background
5. Result appears with a **CRITICAL** risk badge and **Gemini AI-written** explanation

### Step 4 — Review the AI Result
The transfer result card shows:
- **Risk Level:** CRITICAL (transaction blocked)
- **Fraud Probability:** High confidence score
- **AI Summary:** Gemini-written narrative explaining exactly why the transaction was flagged (new device, unusual amount, geo-anomaly, etc.)

### Step 5 — Check Updated Balance
Notice the account balance has **not decreased** because the transaction was blocked by the CRITICAL risk verdict.

### Step 6 — Switch to Admin SOC
1. Log out and log back in as `admin` / `admin123`
2. You land directly on the **SOC Dashboard**

### Step 7 — SOC Dashboard Overview
The dashboard shows live KPIs:
- Total transactions processed
- Active incidents
- Critical alerts count
- Fraud rate percentage
- Average fraud probability
- Quantum threat alerts

### Step 8 — Incident Queue
1. Navigate to **Incidents** in the left sidebar
2. Find the freshly created incident from the transfer in Step 3
3. Click it — an **enterprise-style Drawer** slides in from the right

### Step 9 — Incident Deep Dive (5 Tabs)
The incident drawer has 5 tabs:

| Tab | What It Shows |
|---|---|
| **Timeline** | Ordered event log from login → transfer → risk assessment |
| **Behaviour** | Deviation score from user's normal pattern (amount, time, device) |
| **Correlation** | All correlated signals: device change, new IP, geo-anomaly |
| **Fraud Analysis** | Fraud model probability + confidence breakdown |
| **Quantum Risk** | HNDL exposure score + quantum threat indicators |

### Step 10 — AI Investigator
The **AI Investigator card** (powered by Gemini Flash) shows:
- The full Incident ID and confidence score
- **Why Suspicious** — AI-written narrative of the anomalies
- **Business Impact** — financial and reputational risk assessment
- **Recommendations** — suggested analyst actions

### Step 11 — Live Transaction Monitor
1. Navigate to **Live Monitoring** in the sidebar
2. See the real-time feed of all transactions across all users
3. Each row shows the user, amount, risk level, IP address, and location
4. Auto-refreshes every 30 seconds

### Step 12 — Quantum Intelligence
Navigate to **Quantum Intelligence** to see:
- HNDL (Harvest Now, Decrypt Later) exposure score
- Quantum-vulnerable algorithm alerts
- Quantum readiness indicator

### Step 13 — SOC AI Chat
Navigate to **Settings** (or use the AI Chat panel) to:
- Ask Gemini questions about active incidents
- Get recommendations for threat response

---

## ⚡ The BrainCore 8-Stage Pipeline

Every `POST /user/transfer` triggers this real-time chain:

| Stage | Service | What Happens |
|---|---|---|
| **①** | Submission | Transaction record created, payload validated |
| **②** | `behaviour_engine.py` | Compares amount, time, device, location vs. user's historical baseline → deviation score |
| **③** | `correlation_engine.py` | Cross-references login history, device fingerprint, IP, and geolocation for anomalies |
| **④** | `fraud_client.py` | Returns fraud probability + confidence score (mock or live model) |
| **⑤** | `risk_engine.py` | Combines all scores into final risk level: `LOW / MEDIUM / HIGH / CRITICAL` |
| **⑥** | `incident_builder.py` | Persists full incident record to PostgreSQL |
| **⑦** | `quantum_module.py` | Computes HNDL exposure score and quantum indicators |
| **⑧** | `llm_service.py` | Calls Gemini Flash to generate the human-readable investigation report |

---

## 📁 Codebase Structure

```
FinSpark/
├── README.md                        ← Project overview and setup guide
├── WALKTHROUGH.md                   ← This file
├── .gitignore
│
├── bankshield-backend/              ← FastAPI Python backend (BrainCore)
│   ├── app/
│   │   ├── main.py                  ← FastAPI app entry point + CORS
│   │   ├── config.py                ← Pydantic settings (reads .env)
│   │   ├── database.py              ← SQLAlchemy engine and session
│   │   ├── models/                  ← ORM table definitions
│   │   ├── routers/                 ← API endpoints
│   │   │   ├── auth.py              ← /auth/login, /auth/me
│   │   │   ├── user.py              ← /user/* + Transfer Pipeline
│   │   │   └── admin.py             ← /admin/* SOC endpoints
│   │   ├── services/                ← Intelligence pipeline logic
│   │   ├── schemas/                 ← Pydantic request/response models
│   │   └── utils/
│   │       ├── security.py          ← JWT + bcrypt
│   │       └── seed.py              ← Database seed script
│   ├── requirements.txt
│   └── Dockerfile
│
└── bankshield-frontend/             ← React + TypeScript frontend
    ├── src/
    │   ├── api/                     ← Axios API layer
    │   ├── components/
    │   │   ├── common/              ← RiskBadge, Drawer, Loader, ErrorBoundary
    │   │   ├── customer/            ← BalanceCard, TransferForm, TransactionTable
    │   │   ├── soc/                 ← AIInvestigator, IncidentQueue, QuantumWidget
    │   │   └── layout/              ← Header, SOCSidebar, Footer
    │   ├── pages/                   ← Route-level page components
    │   ├── context/AuthContext.tsx  ← Global auth state (JWT + user)
    │   ├── types/index.ts           ← All TypeScript interfaces
    │   └── utils/                   ← formatters, constants, geolocation
    └── vercel.json                  ← SPA routing for Vercel
```

---

## 🔧 Key Technical Decisions

| Decision | Why |
|---|---|
| `gemini-flash-latest` (not pinned version) | Always resolves to the newest stable model — never goes stale |
| Mock LLM fallback | Demo never breaks even without a valid API key |
| Neon PostgreSQL (cloud) | No local PostgreSQL install required — works on any machine |
| Drawer (not Modal) for incidents | Enterprise feel matching Azure Portal / Linear / GitHub |
| bcrypt direct (not passlib) | passlib is broken on Python 3.13 with bcrypt 5.x |
| ErrorBoundary wrapping entire app | Any component crash shows a friendly error — never a blank screen |
| IP + Geolocation captured per transaction | Enables real geographic anomaly detection for the correlation engine |

---

## 🚀 Live URLs

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | https://fin-spark.vercel.app |
| 🔧 Backend API (Render) | https://finspark-gzwm.onrender.com |
| 📖 Swagger API Docs | https://finspark-gzwm.onrender.com/docs |
| 💻 GitHub Repository | https://github.com/AbhimanyuSah-DEV/FinSpark |
