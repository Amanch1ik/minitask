from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = Field(
        default="postgresql+asyncpg://minitask:minitask@localhost:5432/minitask",
        alias="DATABASE_URL",
    )

    jwt_secret: str = Field(default="change-me", alias="JWT_SECRET", min_length=8)
    jwt_alg: str = Field(default="HS256", alias="JWT_ALG")
    access_token_ttl_min: int = Field(default=60 * 24 * 30, alias="ACCESS_TOKEN_TTL_MIN")

    cookie_name: str = Field(default="minitask_session", alias="COOKIE_NAME")
    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    cookie_samesite: Literal["lax", "strict", "none"] = Field(default="lax", alias="COOKIE_SAMESITE")

    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")

    # Base URL of the web app — used to build verify / reset links in emails.
    public_web_url: str = Field(default="http://localhost:5173", alias="PUBLIC_WEB_URL")

    # --- Email ---
    # Leave SMTP_HOST empty for the free, zero-setup dev backend: the link is
    # printed to the API log instead of being sent. Fill these in (e.g. a free
    # Gmail app password) to send real mail.
    email_from: str = Field(default="minitask <no-reply@minitask.local>", alias="EMAIL_FROM")
    smtp_host: str = Field(default="", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str = Field(default="", alias="SMTP_USER")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")
    smtp_tls: bool = Field(default=True, alias="SMTP_TLS")

    # --- Token TTLs (minutes) ---
    verify_token_ttl_min: int = Field(default=60 * 24, alias="VERIFY_TOKEN_TTL_MIN")  # 1 day
    reset_token_ttl_min: int = Field(default=60, alias="RESET_TOKEN_TTL_MIN")  # 1 hour

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
