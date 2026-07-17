<div align="center">

# 🛡️ BankShield AI

### *Banking Protected by Intelligence*

**AI-powered cyber threat intelligence that correlates cybersecurity telemetry with banking transactions to proactively stop fraud — before it happens.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**[🌐 Live Demo](https://bankshield-ai.vercel.app) · [🔧 API Docs](https://finspark-gzwm.onrender.com/docs)**

</div>

---

> [!IMPORTANT]
> **Note:** This prototype is developed solely for demonstration purposes as part of the hackathon.
> For the best evaluation experience, we recommend accessing the application using **Microsoft Edge** or **Mozilla Firefox**, as some versions of Google Chrome may display a browser security warning for banking-themed prototype websites.

---

## 🔑 Demo Credentials

### 👤 Customer Login
| Field | Value |
|---|---|
| **URL** | https://bankshield-ai.vercel.app/login?role=user |
| **Username** | `rahul_sharma` |
| **Password** | `demo123` |

### 🛡️ Admin / SOC Login
| Field | Value |
|---|---|
| **URL** | https://bankshield-ai.vercel.app/login?role=admin |
| **Username** | `admin` |
| **Password** | `admin123` |

> [!TIP]
> **Signature Demo Flow:** Login as `rahul_sharma` → Transfer **₹8,00,000** to account `ACC-20250002` → Watch the BrainCore AI pipeline flag it as **CRITICAL** → Switch to Admin SOC and investigate the incident in the Incident Queue.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [The BrainCore Intelligence Pipeline](#-the-braincore-intelligence-pipeline)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

## 🎯 Overview

BankShield AI is a full-stack cybersecurity intelligence platform for banks. It solves a critical problem in modern banking: **traditional fraud detection is reactive** — it catches fraud *after* the damage is done.

BankShield AI takes a **predictive approach** by:
- Correlating cybersecurity telemetry (logins, device changes, IP anomalies) with transactional behaviour in real-time
- Running every transaction through an **8-stage AI intelligence pipeline** powered by Google Gemini
- Providing a **SOC (Security Operations Center)** dashboard for bank analysts to investigate, triage, and respond to incidents
- Generating **Gemini AI-written investigation reports** for every flagged transaction — explainable AI, not a black box

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  Landing Page → Customer Dashboard → SOC Admin Dashboard        │
│  Vercel: https://bankshield-ai.vercel.app                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │  REST API (Axios + JWT)
┌─────────────────────────▼───────────────────────────────────────┐
│                  BACKEND — BrainCore Engine (FastAPI)           │
│                                                                  │
│  /auth  ─►  JWT Authentication                                  │
│  /user  ─►  Customer APIs + 8-Stage Transfer Pipeline           │
│  /admin ─►  SOC Dashboard + Incident Management                 │
│                                                                  │
│  Render: https://finspark-gzwm.onrender.com                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
   PostgreSQL (Neon)  Gemini Flash AI  ipapi.co (Geo IP)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS v3, React Router DOM, Axios, Lucide React |
| **Backend** | Python 3.13, FastAPI 0.115, SQLAlchemy 2.0 |
| **Database** | PostgreSQL via Neon (cloud-hosted, serverless) |
| **AI / LLM** | Google Gemini Flash (via `google-generativeai`) |
| **Auth** | JWT (`python-jose`) + bcrypt password hashing |
| **Hosting** | Frontend → Vercel · Backend → Render |

---

## ⚡ The BrainCore Intelligence Pipeline

Every `POST /user/transfer` triggers an **8-stage real-time analysis pipeline**:

```
① Transaction Submitted
     ↓
② Behaviour Profile Analysis
     Computes deviation score from user's historical baseline
     (usual hours, devices, locations, amounts, merchants)
     ↓
③ Correlation Engine
     Cross-references login history, device fingerprint changes,
     IP geolocation anomalies, and session telemetry
     ↓
④ Fraud AI Model
     Returns fraud probability score + confidence level
     ↓
⑤ Risk Engine
     Combines all scores → final risk level
     LOW | MEDIUM | HIGH | CRITICAL
     ↓
⑥ Incident Builder
     Persists full incident record to PostgreSQL with all signals
     ↓
⑦ Quantum Risk Assessment
     HNDL exposure score + quantum-threat indicators (prototype)
     ↓
⑧ Gemini AI Summary Generation
     Writes a full investigation narrative:
     "Why was this flagged?", "Business Impact", "Recommendations"
```

**CRITICAL** transactions are automatically **blocked**. HIGH and MEDIUM transactions are flagged and routed to the SOC queue for analyst review.

---

## ✨ Features

### 👤 Customer Portal
- **Secure Login** with JWT authentication
- **Real-time Balance** that updates after every transaction
- **Transfer Money** with mandatory security password verification
- **Transaction History** with colour-coded risk badges (LOW → CRITICAL)
- **Security Widget** — Current session IP, location, device name, and login time
- **Security Page** — Login history, trusted devices, security score

### 🔐 SOC Admin Dashboard (Defender-style)
- **Live KPI Cards** — Total transactions, active incidents, fraud rate, critical alerts
- **Incident Queue** — Filterable by severity (CRITICAL/HIGH/MEDIUM/LOW)
- **AI Investigator** — Gemini-written investigation reports per incident
- **Incident Drawer** — 5-tab deep dive: Timeline · Behaviour · Correlation · Fraud Analysis · Quantum Risk
- **Account Controls** — Freeze Account, Flag for Review, Escalate, Cancel/Reverse Transaction
- **Live Transaction Monitor** — 30-second auto-refresh feed with IP & location data
- **Quantum Intelligence Widget** — HNDL exposure score and quantum threat indicators
- **SOC AI Chat** — Ask questions about active incidents using Gemini AI ("Discuss this incident")

### 🧠 Intelligence Features
- **Behaviour Profiling** — per-user baseline for unusual time, device, location, and amount detection
- **IP & Geolocation Capture** — every transaction records the user's public IP and location
- **Login History Tracking** — browser, device, IP, location, and status per login
- **Quantum Risk Module** — deterministic HNDL (Harvest Now, Decrypt Later) risk assessment based on transaction value, account balance, device diversity, external routing, and account age

---

## 📁 Project Structure

```
FinSpark/
├── bankshield-backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py          # User accounts
│   │   │   ├── transaction.py   # Transaction records
│   │   │   ├── incident.py      # Security incidents
│   │   │   ├── login_history.py # Login event tracking
│   │   │   └── behaviour_profile.py
│   │   ├── routers/
│   │   │   ├── auth.py          # /auth - Login & JWT
│   │   │   ├── user.py          # /user - Customer APIs + Transfer Pipeline
│   │   │   └── admin.py         # /admin - SOC Dashboard APIs
│   │   ├── services/            # Intelligence pipeline services
│   │   │   ├── behaviour_engine.py
│   │   │   ├── correlation_engine.py
│   │   │   ├── fraud_client.py
│   │   │   ├── risk_engine.py
│   │   │   ├── incident_builder.py
│   │   │   ├── quantum_module.py
│   │   │   ├── llm_service.py   # Gemini AI integration
│   │   │   └── timeline_builder.py
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── utils/
│   │   │   ├── security.py      # JWT + bcrypt helpers
│   │   │   └── seed.py          # Database seeder
│   │   ├── config.py            # Pydantic settings
│   │   ├── database.py          # SQLAlchemy engine setup
│   │   └── main.py              # FastAPI app + CORS
│   ├── requirements.txt
│   └── Dockerfile
│
└── bankshield-frontend/         # React + TypeScript frontend
    ├── src/
    │   ├── api/                 # Axios API layer
    │   │   ├── client.ts        # Axios instance + JWT interceptor
    │   │   ├── auth.api.ts
    │   │   ├── user.api.ts
    │   │   └── admin.api.ts
    │   ├── components/
    │   │   ├── common/          # RiskBadge, Drawer, Loader, ErrorBoundary
    │   │   ├── customer/        # BalanceCard, TransferForm, TransactionTable
    │   │   ├── soc/             # AIInvestigator, IncidentQueue, LiveTransactionTable
    │   │   └── layout/          # Header, SOCSidebar, Footer
    │   ├── pages/               # Route-level page components
    │   ├── context/             # AuthContext (JWT + user state)
    │   ├── types/               # TypeScript interfaces
    │   └── utils/               # formatters, geolocation, parseUserAgent
    └── vercel.json              # SPA routing config for Vercel
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- A PostgreSQL database (local or Neon cloud)

### 1. Clone the repository
```bash
git clone https://github.com/AbhimanyuSah-DEV/FinSpark.git
cd FinSpark
```

### 2. Backend Setup
```bash
cd bankshield-backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file and fill in your values
# (see Environment Variables section below)

# Seed the database with demo data
python -m app.utils.seed

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd bankshield-frontend

# Install dependencies
npm install

# Point the frontend at your local backend
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start the dev server
npm run dev
```

### 4. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

> [!NOTE]
> `GEMINI_API_KEY` is optional. If left empty, the system automatically falls back to a realistic mock LLM response so the demo never breaks.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/auth/me` | Get current authenticated user |

### Customer APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user/dashboard` | Balance, account info |
| `GET` | `/user/transactions` | Transaction history |
| `GET` | `/user/profile` | User profile |
| `GET` | `/user/login-history` | Login event history |
| `POST` | `/user/transfer` | Initiate transfer (triggers 8-stage pipeline) |

### Admin / SOC APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | KPI stats, recent incidents, live transactions |
| `GET` | `/admin/incidents` | All incidents (filterable by risk level) |
| `GET` | `/admin/incidents/{id}` | Full incident detail with AI summary |
| `GET` | `/admin/transactions` | All transactions across all users |
| `GET` | `/admin/quantum` | Quantum risk overview |
| `GET` | `/admin/users` | All registered users |
| `POST` | `/admin/chat` | SOC AI Chat (Gemini-powered) |
| `POST` | `/admin/transactions/{id}/action` | Cancel or reverse a transaction |

---

## ⚙️ Environment Variables

### Backend (`bankshield-backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRAUD_MODEL_URL=mock
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:5173,https://bankshield-ai.vercel.app
ENVIRONMENT=development
```

### Frontend (`bankshield-frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ☁️ Deployment

### Backend → Render.com
- **Root Directory:** `bankshield-backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add all environment variables in the Render dashboard
- Set `CORS_ORIGINS` to your Vercel frontend URL (no trailing slash)

### Frontend → Vercel
- **Root Directory:** `bankshield-frontend`
- **Framework:** Vite (auto-detected)
- **Environment Variable:** `VITE_API_BASE_URL=https://finspark-gzwm.onrender.com`
- The included `vercel.json` handles SPA client-side routing automatically

> [!WARNING]
> The backend runs on Render's **free tier** which spins down after 15 minutes of inactivity. On first visit, allow **30–60 seconds** for the backend to wake up, then try logging in again.

---

## 🔒 Security Notes

- All passwords are hashed with **bcrypt** (never stored in plaintext)
- Every API endpoint is protected with **JWT Bearer token** authentication
- **Role-based access control** (USER / ADMIN) enforced at the router level
- The `.env` file is gitignored — never commit secrets to version control
- IP addresses are captured at transaction time for audit trail purposes

---

<div align="center">

Built with ❤️ for **FinSpark'26 · Bank of Maharashtra Hackathon**

*Educational prototype — not affiliated with or endorsed by Bank of Maharashtra*

</div>
