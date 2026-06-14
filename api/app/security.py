import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_settings = get_settings()


def hash_password(plain: str) -> str:
    # bcrypt caps the password at 72 bytes. Truncating at the schema layer keeps
    # the behaviour explicit instead of letting passlib silently chop it later.
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def create_access_token(user_id: UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=_settings.access_token_ttl_min)).timestamp()),
    }
    return jwt.encode(payload, _settings.jwt_secret, algorithm=_settings.jwt_alg)


def decode_access_token(token: str) -> UUID | None:
    try:
        payload = jwt.decode(token, _settings.jwt_secret, algorithms=[_settings.jwt_alg])
    except JWTError:
        return None

    sub = payload.get("sub")
    if not sub:
        return None
    try:
        return UUID(sub)
    except ValueError:
        return None


def create_purpose_token(
    user_id: UUID, purpose: str, ttl_min: int, fingerprint: str | None = None
) -> str:
    """Signed, expiring token scoped to a single purpose (email verify / reset).

    `fingerprint` binds the token to mutable account state — we pass the current
    password hash for reset tokens, so resetting (or otherwise changing) the
    password invalidates any outstanding reset links. One-time use, no table.
    """
    now = datetime.now(timezone.utc)
    payload: dict = {
        "sub": str(user_id),
        "purpose": purpose,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ttl_min)).timestamp()),
    }
    if fingerprint is not None:
        payload["fp"] = _fingerprint(fingerprint)
    return jwt.encode(payload, _settings.jwt_secret, algorithm=_settings.jwt_alg)


def decode_purpose_token(
    token: str, purpose: str, fingerprint: str | None = None
) -> UUID | None:
    try:
        payload = jwt.decode(token, _settings.jwt_secret, algorithms=[_settings.jwt_alg])
    except JWTError:
        return None

    if payload.get("purpose") != purpose:
        return None
    if fingerprint is not None and payload.get("fp") != _fingerprint(fingerprint):
        return None

    sub = payload.get("sub")
    if not sub:
        return None
    try:
        return UUID(sub)
    except ValueError:
        return None


def _fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]
