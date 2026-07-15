from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole


# ── Request Schemas ────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.USER


class LoginRequest(BaseModel):
    username: str
    password: str
    # Cybersecurity telemetry captured at login time
    ip_address: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None


# ── Response Schemas ───────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    full_name: str


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    username: str
    role: UserRole
    account_number: str
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True
