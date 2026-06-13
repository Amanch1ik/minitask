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

from app.db import Base, engine
from app.main import app


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _clean_tables():
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE tasks, users RESTART IDENTITY CASCADE"))
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient):
    """Register a user and return an httpx client with the session cookie set."""
    resp = await client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 201, resp.text
    return client
