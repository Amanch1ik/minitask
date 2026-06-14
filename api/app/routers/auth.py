from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.deps import get_optional_user
from app.email import send_reset_email, send_verification_email
from app.limiter import limiter
from app.models import User
from app.schemas import (
    EmailIn,
    LoginIn,
    MessageOut,
    RegisterIn,
    ResetPasswordIn,
    TokenIn,
    UserOut,
)
from app.security import (
    create_access_token,
    create_purpose_token,
    decode_purpose_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

_settings = get_settings()

_PURPOSE_VERIFY = "email_verify"
_PURPOSE_RESET = "password_reset"

# Generic responses keep these endpoints from leaking whether an email exists.
_CHECK_INBOX = "If that email needs confirming, we've sent a link."
_RESET_SENT = "If that account exists, a reset link is on its way."


def _set_session_cookie(response: Response, user_id) -> None:
    token = create_access_token(user_id)
    response.set_cookie(
        key=_settings.cookie_name,
        value=token,
        max_age=_settings.access_token_ttl_min * 60,
        httponly=True,
        secure=_settings.cookie_secure,
        samesite=_settings.cookie_samesite,
        path="/",
    )


def _verify_link(user: User) -> str:
    token = create_purpose_token(user.id, _PURPOSE_VERIFY, _settings.verify_token_ttl_min)
    return f"{_settings.public_web_url.rstrip('/')}/verify?token={token}"


def _reset_link(user: User) -> str:
    # Bind to the current password hash so the link dies once the password
    # changes (one-time use without a tokens table).
    token = create_purpose_token(
        user.id, _PURPOSE_RESET, _settings.reset_token_ttl_min, fingerprint=user.password_hash
    )
    return f"{_settings.public_web_url.rstrip('/')}/reset-password?token={token}"


@router.post("/register", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    payload: RegisterIn,
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    await db.refresh(user)

    # No session yet — the account is locked until the email is confirmed.
    await send_verification_email(user.email, _verify_link(user))
    return MessageOut(message=_CHECK_INBOX)


@router.post("/verify", response_model=UserOut)
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    payload: TokenIn,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    user_id = decode_purpose_token(payload.token, _PURPOSE_VERIFY)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This confirmation link is invalid or has expired.",
        )

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This confirmation link is invalid or has expired.",
        )

    if not user.is_verified:
        user.is_verified = True
        await db.commit()
        await db.refresh(user)

    # Confirming the email logs the user straight in.
    _set_session_cookie(response, user.id)
    return user


@router.post("/resend-verification", response_model=MessageOut)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    payload: EmailIn,
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if user is not None and not user.is_verified:
        await send_verification_email(user.email, _verify_link(user))
    return MessageOut(message=_CHECK_INBOX)


@router.post("/login", response_model=UserOut)
@limiter.limit("10/minute")
async def login(
    request: Request,
    payload: LoginIn,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()

    # Same generic error for "no such user" and "wrong password" so we do not
    # let an attacker enumerate registered emails.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )

    _set_session_cookie(response, user.id)
    return user


@router.post("/forgot-password", response_model=MessageOut)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    payload: EmailIn,
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if user is not None:
        await send_reset_email(user.email, _reset_link(user))
    return MessageOut(message=_RESET_SENT)


@router.post("/reset-password", response_model=UserOut)
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    payload: ResetPasswordIn,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    # Decode without the fingerprint first to find the user, then validate the
    # fingerprint against their current hash (binds the token to that password).
    user_id = decode_purpose_token(payload.token, _PURPOSE_RESET)
    user = await db.get(User, user_id) if user_id is not None else None
    if user is None or decode_purpose_token(
        payload.token, _PURPOSE_RESET, fingerprint=user.password_hash
    ) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )

    user.password_hash = hash_password(payload.password)
    # Receiving the reset mail proves ownership of the address.
    user.is_verified = True
    await db.commit()
    await db.refresh(user)

    # Log the user straight in with the new password.
    _set_session_cookie(response, user.id)
    return user


@router.get("/me", response_model=UserOut | None)
async def me(user: User | None = Depends(get_optional_user)) -> User | None:
    # Returns 200 with the user, or 200 with `null` when there is no session.
    # Keeping this off the 401 path means the boot-time probe does not light up
    # the browser console with a failed request on first visit.
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    # Set the clearing cookie on the injected response and return no body — a
    # 204 must not carry content. FastAPI keeps the Set-Cookie header.
    response.delete_cookie(
        key=_settings.cookie_name,
        path="/",
        httponly=True,
        secure=_settings.cookie_secure,
        samesite=_settings.cookie_samesite,
    )
