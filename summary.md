# BankShield AI — Implementation Summary

> **Tagline:** "Banking Protected by Intelligence"
> **Hackathon:** FinSpark'26 · Bank of Maharashtra
> **Problem Statement:** AI-Driven Correlation of Cybersecurity Telemetry & Transactional Behaviour

---

## 🏗️ Project Structure

```
Mahabank Hack/
├── bankshield-backend/     ← FastAPI Python backend (BrainCore)
└── bankshield-frontend/    ← React + TypeScript + Tailwind (StoryView)
```

---

## ⚙️ Backend — BrainCore Intelligence Engine

**Stack:** Python · FastAPI · SQLAlchemy · PostgreSQL (Neon) · Gemini AI

### Database Models (`app/models/`)
| Model | Purpose |
|---|---|
| `User` | Customer accounts with balance, role (USER/ADMIN) |
| `Transaction` | All financial transactions with telemetry fields (device, IP, location) |
| `LoginHistory` | Login events with device, IP, browser, location tracking |
| `Incident` | Security incidents with full risk scores, AI summary, quantum indicators |
| `BehaviourProfile` | Per-user baseline: usual locations, devices, merchants, hours, amounts |

### API Routers (`app/routers/`)
| Router | Endpoints |
|---|---|
| `auth.py` | `POST /auth/login` · `GET /auth/me` |
| `user.py` | `GET /user/dashboard` · `GET /user/transactions` · `GET /user/profile` · `POST /user/transfer` |
| `admin.py` | `GET /admin/dashboard` · `GET /admin/incidents` · `GET /admin/incidents/{id}` · `GET /admin/transactions` · `GET /admin/quantum` · `GET /admin/behaviour/{user_id}` · `GET /admin/users` |

### Intelligence Pipeline — 8 Stages (triggered on every `POST /user/transfer`)

```
① Transaction Submitted
② Behaviour Profile Analysis     → deviation score computed
③ Correlation Engine              → cross-references login, device, IP, geo
④ Fraud AI Model                  → probability + confidence score
⑤ Risk Engine                     → overall risk score + level (LOW/MEDIUM/HIGH/CRITICAL)
⑥ Incident Builder                → creates Incident record in DB
⑦ Quantum Risk Assessment         → HNDL exposure score, quantum indicators
⑧ AI Summary Generation           → Gemini generates narrative investigation report
```

### Intelligence Services (`app/services/`)
| Service | What It Does |
|---|---|
| `behaviour_engine.py` | Builds and updates user behaviour profiles; computes deviation score |
| `correlation_engine.py` | Aggregates login history, device changes, geo-anomalies into signals |
| `fraud_client.py` | Calls fraud model (mock returns realistic probability scores) |
| `risk_engine.py` | Combines all scores into final risk level (LOW/MEDIUM/HIGH/CRITICAL) |
| `timeline_builder.py` | Builds ordered event timeline for each incident |
| `incident_builder.py` | Persists the full incident record to PostgreSQL |
| `quantum_module.py` | Simulated quantum risk indicators (HNDL warning, exposure score) |
| `llm_service.py` | Calls **Gemini Flash** for AI investigation summary; auto-falls back to mock |

### Security & Auth
- **JWT** authentication with role-based access (USER / ADMIN)
- **bcrypt** password hashing — direct bcrypt calls (Python 3.13 compatible, avoids passlib conflict)
- `get_current_user` middleware injects authenticated user into every protected route

### Seed Data (`app/seed.py`)
- 5 demo customers with realistic Indian names, accounts, and behaviour profiles
- 1 admin account
- 50+ seeded transactions with varying risk levels
- 10 pre-built incidents across LOW → CRITICAL
- Realistic behaviour profiles to enable deviation detection

---

## 🎨 Frontend — StoryView

**Stack:** React 18 · TypeScript · Vite · TailwindCSS v3 · Axios · React Router DOM · Lucide React

### Design System — Dark Teal + Gold Theme
Inspired by the FinSpark'26 / Bank of Maharashtra hackathon visual identity.

| Token | Value | Usage |
|---|---|---|
| `background` | `#0B2535` | Page background |
| `surface` | `#112D3E` | Cards, panels |
| `surface-2` | `#1A3A4E` | Elevated / hover |
| `gold` | `#F5A623` | CTA buttons, logo accent |
| `text` | `#FFFFFF` | All headings |
| `muted` | `#94A3B8` | Body text, labels |
| `border` | `#1E3A4A` | Card borders |
| `danger` | `#DC2626` | CRITICAL risk |
| `warning` | `#F59E0B` | MEDIUM risk |
| `success` | `#16A34A` | LOW risk |

---

### Pages

| Page | Route | Access | Description |
|---|---|---|---|
| `LandingPage` | `/` | Public | Hero · WhyAIBanking · Intelligence Pipeline · AI Features · Quick Services |
| `LoginPage` | `/login` | Public | Role tabs (Customer / Admin) · Demo credential auto-fill |
| `CustomerDashboardPage` | `/dashboard` | USER | Balance · Transfer Form · Transactions · Security Widget |
| `CustomerSecurityPage` | `/security` | USER | Security Score · Trusted Devices · Login History |
| `SecurityCenterPage` | `/soc` | ADMIN | Full SOC dashboard with Defender-style sidebar |
| `NotFoundPage` | `*` | Public | 404 fallback |

### Route Guards
- `UserRoute` — unauthenticated → `/login`, admin → `/soc`
- `AdminRoute` — unauthenticated → `/login`, user → `/dashboard`
- `PublicRoute` — logged-in users auto-redirected to their dashboard

---

### Components

#### Common
| Component | Purpose |
|---|---|
| `RiskBadge` | LOW/MEDIUM/HIGH/CRITICAL with animated pulsing dot |
| `PipelineProgress` | **BrainCore Pipeline** — 8-stage animated visualiser shown during transfers |
| `Drawer` | Enterprise right-side slide-in panel (Azure Portal style) |
| `ErrorBoundary` | Global crash handler — prevents blank pages on any component error |
| `Loader` | Gold spinner, full-page overlay mode |

#### Layout
| Component | Purpose |
|---|---|
| `Header` | Navigation bar — role-aware, BankShield logo |
| `SOCSidebar` | Defender-style sidebar: Dashboard · Threat Intelligence · Incidents · Live Monitoring · Quantum Intelligence · Settings |
| `Footer` | Bank of Maharashtra branding |

#### Customer
| Component | Purpose |
|---|---|
| `BalanceCard` | Large INR balance, masked account number, quick actions |
| `TransferForm` | Collapsible inline form + BrainCore pipeline animation on submit |
| `TransactionTable` | Colour-coded transaction history with status chips |
| `SecurityWidget` | Security Score 98% · Last Login location · Device Trust status |
| `ProfileCard` | Gold-initial avatar, name, account number |
| `QuickActions` | 4-tile grid: Transfer · History · Statement · Support |

#### SOC Admin
| Component | Purpose |
|---|---|
| `DashboardCards` | 6 KPI cards: Transactions · Incidents · Critical · Fraud Rate · Avg Probability · Quantum Alerts |
| `ThreatIntelOverview` | Most recent incident's horizontal timeline + correlation signals |
| `HorizontalTimeline` | Scrollable horizontal event flow with colour-coded nodes |
| `AIInvestigator` | **Centerpiece card** — Incident ID · Confidence · AI Summary · Why Suspicious · Business Impact · Recommendations |
| `LiveTransactionTable` | Real-time feed with 30s auto-refresh + manual Refresh Now button |
| `IncidentQueue` | Filterable list (ALL/CRITICAL/HIGH/MEDIUM/LOW) — click → Drawer |
| `IncidentDrawer` | 5-tab panel: Timeline · Behaviour · Correlation · Fraud Analysis · Quantum Risk |
| `QuantumWidget` | HNDL exposure score · Quantum alerts · Prototype indicator disclaimer |

---

### API Layer

| File | Functions |
|---|---|
| `client.ts` | Axios instance · JWT `Authorization: Bearer` interceptor · 401 → auto redirect to login |
| `auth.api.ts` | `login()` · `getMe()` |
| `user.api.ts` | `getUserDashboard()` · `getMyTransactions()` · `getUserProfile()` · `submitTransfer()` |
| `admin.api.ts` | `getAdminDashboard()` · `getIncidents()` · `getIncidentDetail()` · `getAllTransactions()` · `getQuantumOverview()` · `getBehaviourProfile()` |

> `getIncidentDetail()` uses the human-readable `incident_id` string (e.g. `INC-1003`), not the UUID — matching the backend route.

---

## 🐛 Bugs Fixed

| Bug | Root Cause | Fix Applied |
|---|---|---|
| Landing page goes blank | `HorizontalTimeline` crashed on invalid date → no error boundary → full page wiped | `safeDate()` guard on all formatters + global `ErrorBoundary` |
| Network error on login / transfer | `allow_origins=["*"]` + `allow_credentials=True` is rejected by browsers | Changed CORS to explicit origin list in `main.py` |
| Gemini returning 404 | `gemini-1.5-flash` not available on this API key tier | Probed available models, switched to `gemini-flash-latest` |
| TypeScript build fails | `erasableSyntaxOnly: true` in tsconfig bans enums | Removed from `tsconfig.app.json` |
| Axios `implicit any` errors | `verbatimModuleSyntax` requires `import type` for all types | Added `AxiosResponse<T>` annotations to all API functions |
| bcrypt incompatibility | `passlib` broken on Python 3.13 with `bcrypt 5.x` | Replaced with direct `bcrypt` calls in `security.py` |

---

## 🚀 How to Run

**Terminal 1 — Backend**
```powershell
cd bankshield-backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```powershell
cd bankshield-frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Customer | `rahul_sharma` | `demo123` |
| Customer | `priya_patel` | `demo123` |
| Admin SOC | `admin` | `admin123` |

---

## 🎯 Signature Demo Flow

1. `http://localhost:5173` — Landing page educates judges on the AI pipeline
2. Login as `rahul_sharma / demo123`
3. Open **New Transfer** → send **₹8,00,000** to `ACC-20250002`
4. Watch **BrainCore Pipeline** animate through 8 real backend stages
5. Result shows **CRITICAL** risk badge + **Gemini AI** written summary
6. Switch to Admin SOC → `admin / admin123`
7. New incident appears in **Incident Queue**
8. Click incident → **Drawer** slides in with 5 tabs
9. **AI Investigator** shows full Gemini-written investigation report
10. **Quantum Widget** shows HNDL exposure score and prototype indicators

---

## 📌 Key Technical Decisions

| Decision | Reason |
|---|---|
| `gemini-flash-latest` (not versioned) | Always resolves to newest stable model — never becomes stale |
| Mock LLM fallback | Demo never breaks even without a valid API key |
| Neon PostgreSQL (cloud) | No local PostgreSQL install required |
| Drawer instead of Modal for incidents | Enterprise feel matching Azure Portal / Linear / GitHub |
| Inline transfer form | Keeps judges focused on the BrainCore pipeline — no extra navigation |
| `ErrorBoundary` wrapping entire app | Any future component crash shows friendly error, not blank screen |
