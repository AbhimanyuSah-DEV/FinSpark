from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from typing import Generator
from app.config import settings


class Base(DeclarativeBase):
    pass


# ── Lazy engine initialisation ────────────────────────────────────────────────
# The engine is created on first access rather than at module import time.
# This allows the app to import cleanly in environments where the database
# driver (psycopg2) is not installed (e.g. local import/lint checks).
# The driver is required on Render (production) where psycopg2-binary is available.

_engine = None
_SessionLocal = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )
    return _engine


def _get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a database session and closes it after the request."""
    db = _get_session_factory()()
    try:
        yield db
    finally:
        db.close()


# Convenience accessor used by seed.py and migrations
def get_engine():
    return _get_engine()


def SessionLocal():
    return _get_session_factory()()
