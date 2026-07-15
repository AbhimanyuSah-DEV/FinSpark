import uuid
import random
import string
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.login_history import LoginHistory, LoginStatus
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _generate_account_number() -> str:
    """Generate a random 12-digit account number."""
    return "MH" + "".join(random.choices(string.digits, k=10))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user. Returns the created user profile."""
    # Check duplicates
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        id=uuid.uuid4(),
        full_name=payload.full_name,
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        account_number=_generate_account_number(),
        balance=100000.00,  # Default starting balance for demo
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate user and return a JWT token.
    Captures login telemetry (IP, device, browser, location) for the Correlation Engine.
    """
    user = db.query(User).filter(User.username == payload.username).first()

    # Determine login success
    success = user is not None and verify_password(payload.password, user.password_hash)
    login_status = LoginStatus.SUCCESS if success else LoginStatus.FAILED

    # Record login telemetry regardless of outcome
    # Use provided telemetry or fall back to request metadata
    ip = payload.ip_address or request.client.host if request.client else None

    if user:
        log_entry = LoginHistory(
            id=uuid.uuid4(),
            user_id=user.id,
            ip_address=ip,
            device=payload.device,
            browser=payload.browser,
            location=payload.location,
            login_status=login_status,
        )
        db.add(log_entry)
        db.commit()

    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=str(user.id),
        full_name=user.full_name,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user
