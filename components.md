# React Component Specification

## Layout

AppLayout
Header
Sidebar (Admin)
Footer

---

## Landing Page

Header.tsx
Hero.tsx
QuickServices.tsx
AISecurityFeatures.tsx
HowItWorks.tsx
Footer.tsx

---

## Authentication

LoginForm.tsx
RoleSelector.tsx

APIs

POST /auth/login

---

## Customer Dashboard

BalanceCard.tsx
QuickActions.tsx
TransactionTable.tsx
ProfileCard.tsx
SecurityStatusCard.tsx

APIs

GET /user/profile
GET /user/transactions

---

## Admin Dashboard

DashboardCards.tsx
LiveTransactionTable.tsx
IncidentQueue.tsx
ThreatTimeline.tsx
AIInvestigator.tsx
QuantumWidget.tsx
RiskDistributionChart.tsx
IncidentDetailsModal.tsx

APIs

GET /admin/dashboard
GET /admin/incidents
GET /admin/incidents/{id}

---

## Common Components

Button
Card
Badge
Table
Modal
Chart
SearchBar
Loader
Toast

---

## UI Behaviour

Click Incident

↓

Open IncidentDetailsModal

↓

Fetch

GET /admin/incidents/{id}

↓

Render

- Timeline
- Behaviour
- Correlation
- Quantum
- AI Summary

No business logic should exist inside React components.

Frontend is responsible only for visualization and API consumption.
