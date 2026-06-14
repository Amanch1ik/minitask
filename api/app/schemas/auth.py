from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class _Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class RegisterIn(_Credentials):
    pass


class LoginIn(_Credentials):
    pass


class EmailIn(BaseModel):
    """Bare email — for resend-verification and forgot-password."""

    email: EmailStr


class TokenIn(BaseModel):
    """Token-only body — for email verification."""

    token: str = Field(min_length=1)


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=1)
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    is_verified: bool
    created_at: datetime


class MessageOut(BaseModel):
    message: str
