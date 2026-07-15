from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, user, admin

app = FastAPI(
    title="BankShield AI — BrainCore",
    description=(
        "Incident Intelligence Platform for Bank of Maharashtra. "
        "Correlates cybersecurity telemetry with transactional behaviour "
        "to detect, classify, and explain cyber-financial threats."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "BankShield AI — BrainCore",
        "status": "operational",
        "version": "1.0.0",
        "environment": settings.environment,
        "fraud_model": "mock" if settings.use_mock_fraud else settings.fraud_model_url,
        "llm": "mock" if settings.use_mock_llm else "gemini",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
