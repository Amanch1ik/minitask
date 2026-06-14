import os

# Override settings before app modules import. The test database can be any
# postgres reachable from the runner — defaults to the same docker compose
# Postgres exposed on host port 5433.
os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+asyncpg://minitask:minitask@localhost:5433/minitask_test",
    ),
)
os.environ.setdefault("JWT_SECRET", "test-secret-long-enough-for-prod-validator")
os.environ.setdefault("COOKIE_SECURE", "false")
os.environ.setdefault("CORS_ORIGINS", "http://testserver")

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.db import Base, get_db
from app.limiter import limiter
from app.main import app

# Rate limits are global, in-memory and persist across tests; the suite would
# blow the per-minute caps and get spurious 429s. Disable for tests — limit
# behaviour is an integration concern, not a unit one.
limiter.enabled = False

# Dedicated test engine with NullPool. pytest-asyncio runs tests on per-test
# event loops; a pooled asyncpg connection created on one loop and reused on the
# next blows up ("attached to a different loop"). NullPool opens a fresh
# connection on the current loop for every checkout and closes it on release, so
# nothing is ever carried across loops.
test_engine = create_async_engine(os.environ["DATABASE_URL"], poolclass=NullPool)
TestSession = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)


async def _override_get_db():
    async with TestSession() as session:
        yield session


# Route the app's DB dependency through the NullPool test engine.
app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _schema():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _clean_tables():
    async with test_engine.begin() as conn:
        await conn.execute(text("TRUNCATE tasks, users RESTART IDENTITY CASCADE"))
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient):
    """Register a user, confirm their email, and return a client with a session."""
    email = "alice@example.com"
    resp = await client.post(
        "/auth/register",
        json={"email": email, "password": "supersecret"},
    )
    assert resp.status_code == 201, resp.text

    confirmed = await client.post("/auth/verify", json={"token": await verify_token_for(email)})
    assert confirmed.status_code == 200, confirmed.text
    return client


async def register_verified(client: AsyncClient, email: str, password: str = "supersecret") -> None:
    """Register and confirm a user — the verify call logs them in on `client`."""
    reg = await client.post("/auth/register", json={"email": email, "password": password})
    assert reg.status_code == 201, reg.text
    confirmed = await client.post("/auth/verify", json={"token": await verify_token_for(email)})
    assert confirmed.status_code == 200, confirmed.text


async def verify_token_for(email: str) -> str:
    """Build the same email-verification token the API would have mailed."""
    from sqlalchemy import select

    from app.config import get_settings
    from app.models import User
    from app.routers.auth import _PURPOSE_VERIFY
    from app.security import create_purpose_token

    async with TestSession() as session:
        result = await session.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one()
    return create_purpose_token(user.id, _PURPOSE_VERIFY, get_settings().verify_token_ttl_min)


async def reset_token_for(email: str) -> str:
    """Build the same password-reset token the API would have mailed."""
    from sqlalchemy import select

    from app.config import get_settings
    from app.models import User
    from app.routers.auth import _PURPOSE_RESET
    from app.security import create_purpose_token

    async with TestSession() as session:
        result = await session.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one()
    return create_purpose_token(
        user.id, _PURPOSE_RESET, get_settings().reset_token_ttl_min, fingerprint=user.password_hash
    )
