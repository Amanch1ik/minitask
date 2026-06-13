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


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    created_at: datetime
