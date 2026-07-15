# backend.md

# BrainCore - Backend Specification

## Mission

You are responsible for building the **Brain** of BankShield AI.

Your goal is NOT to build a banking application.

Your goal is to build an intelligence engine that:

- Stores banking data
- Stores login telemetry
- Analyses every transaction
- Correlates cyber events with financial events
- Detects suspicious activity
- Generates explainable AI summaries
- Serves clean REST APIs to the frontend

---

# Tech Stack

- FastAPI
- Python
- PostgreSQL (Neon)
- SQLAlchemy
- JWT Authentication
- Pydantic
- Requests/httpx
- Render (deployment)

---

# Architecture

Transaction
→ Store in Database
→ Call Fraud Model API
→ Receive Fraud Score
→ Correlate with Login History
→ Calculate Overall Risk
→ Generate AI Summary
→ Save Alert
→ Return Response

---

# Database Tables

## users
- id
- full_name
- email
- password_hash
- role (USER / ADMIN)
- account_number
- created_at

## login_history
- id
- user_id
- login_time
- ip_address
- device
- browser
- location
- login_status

## transactions
- id
- sender
- receiver
- amount
- merchant
- transaction_type
- timestamp
- device
- location
- status

## alerts
- id
- transaction_id
- fraud_probability
- overall_risk
- severity
- ai_summary
- created_at

---

# Authentication

Implement

- Register
- Login
- JWT Tokens
- Role Based Authentication

Roles

- USER
- ADMIN

---

# Fraud Model Integration

The fraud model is hosted separately on Render.

The backend MUST call the deployed endpoint for every transaction.

Example Flow

POST /predict

↓

Receive

- fraud_probability
- confidence
- reasons

Do NOT implement fraud detection logic inside the backend.

---

# Correlation Engine

Correlate

- Login history
- Device changes
- IP changes
- Location changes
- Transaction amount
- Fraud score

Generate a unified incident if suspicious.

Example Rule

Unknown Device
+
Different Location
+
High Fraud Probability

→ Critical Alert

---

# Risk Engine

Compute a final score using

- Fraud Probability
- Login Behaviour
- Device Risk
- Location Risk
- Transaction Value

Return

- LOW
- MEDIUM
- HIGH
- CRITICAL

---

# LLM Summary

When HIGH or CRITICAL

Send relevant context to Gemini/OpenAI.

Return

- Incident Summary
- Why it is suspicious
- Business Impact
- Recommended Actions

Store this summary in alerts.

---

# Quantum Risk Module

Prototype only.

Detect indicators such as

- Encrypted archive access
- Backup download
- Key/certificate export

Return

- Quantum Exposure Score
- HNDL Warning
- Recommendation

---

# REST APIs

POST /register
POST /login

GET /dashboard

POST /transaction
GET /transactions

GET /alerts
GET /alerts/{id}

POST /predict-transaction

GET /summary/{id}

---

# Deliverables

- Working FastAPI project
- PostgreSQL schema
- REST APIs
- JWT Authentication
- Fraud API integration
- Correlation engine
- Risk engine
- AI summary integration
- Quantum module
- Ready for deployment on Render
