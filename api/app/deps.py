from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.models import User
from app.security import decode_access_token

_settings = get_settings()


async def get_optional_user(
    session_token: str | None = Cookie(default=None, alias=_settings.cookie_name),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Resolve the current user, or None when there is no valid session.

    Unlike `get_current_user`, this never raises — it lets endpoints treat
    "not logged in" as a normal, non-error outcome (e.g. the boot-time
    `/auth/me` probe that should not surface a 401 in the browser console).
    """
    if not session_token:
        return None

    user_id = decode_access_token(session_token)
    if user_id is None:
        return None

    return await db.get(User, user_id)


async def get_current_user(
    user: User | None = Depends(get_optional_user),
) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user
