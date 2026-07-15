# frontend.md

# StoryView - Frontend Specification

## Mission

You are responsible for building the **Story** of BankShield AI.

The frontend should transform backend intelligence into a clear, modern, and engaging experience.

Focus on clarity, polish, and storytelling rather than excessive features.

---

# Tech Stack

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Recharts (or Chart.js)

---

# Authentication

Create a professional login page.

Support

- Username + Password
- OTP login (optional placeholder)

After login

USER → User Dashboard

ADMIN → Admin Dashboard

---

# User Dashboard

Purpose

A simple banking interface.

Features

- Account Overview
- Balance Card
- Recent Transactions
- Money Transfer Form
- Transaction History
- Profile

All data comes from backend APIs.

---

# Admin Dashboard

This is the primary hackathon demo screen.

## KPI Cards

- Total Transactions
- High Risk Alerts
- Fraud Rate
- Quantum Alerts

## Live Transaction Feed

Display

- Sender
- Receiver
- Amount
- Fraud Score
- Risk
- Status

## AI Investigation Panel

Display backend-generated summary.

Include

- Incident Summary
- Reasons
- Business Impact
- Recommended Action

## Correlation Timeline

Visual flow

Login
→ Device Change
→ Transaction
→ Fraud Detection
→ Alert

## Analytics

Charts for

- Risk Distribution
- Transactions
- Alerts

## Quantum Widget

Display

- Quantum Exposure Score
- HNDL Warning
- Recommendation

---

# API Integration

Consume only backend APIs.

No business logic in frontend.

Required endpoints

POST /login

GET /dashboard

POST /transaction

GET /transactions

GET /alerts

GET /summary/{id}

---

# UI Theme

Enterprise SOC Dashboard

Use

- Dark theme
- Clean cards
- Minimal colors
- Responsive layout
- Smooth animations

Avoid unnecessary visual clutter.

---

# Deliverables

- Authentication screens
- User Dashboard
- Admin Dashboard
- Transaction table
- Alert views
- AI summary panel
- Correlation timeline
- Charts
- API integration
- Polished demo-ready UI
