import pytest
from httpx import AsyncClient


async def test_register_sets_session_cookie(client: AsyncClient):
    resp = await client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "bob@example.com"
    assert "id" in body

    # Cookie is set, httponly and not visible to JS.
    set_cookie = resp.headers.get("set-cookie", "")
    assert "minitask_session=" in set_cookie
    assert "HttpOnly" in set_cookie


async def test_register_rejects_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "supersecret"}
    first = await client.post("/auth/register", json=payload)
    assert first.status_code == 201

    second = await client.post("/auth/register", json=payload)
    assert second.status_code == 409


async def test_register_rejects_short_password(client: AsyncClient):
    resp = await client.post(
        "/auth/register",
        json={"email": "x@example.com", "password": "short"},
    )
    assert resp.status_code == 422


@pytest.mark.parametrize(
    "email,password",
    [
        ("nobody@example.com", "supersecret"),  # no such user
        ("alice@example.com", "wrongpassword"),  # wrong password
    ],
)
async def test_login_returns_same_error_for_unknown_and_wrong(
    auth_client: AsyncClient, email: str, password: str
):
    resp = await auth_client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"


async def test_login_succeeds_with_right_credentials(auth_client: AsyncClient):
    auth_client.cookies.clear()
    resp = await auth_client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 200
    assert resp.cookies.get("minitask_session")


async def test_me_requires_session(client: AsyncClient):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


async def test_me_returns_current_user(auth_client: AsyncClient):
    resp = await auth_client.get("/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "alice@example.com"


async def test_logout_clears_cookie(auth_client: AsyncClient):
    resp = await auth_client.post("/auth/logout")
    assert resp.status_code == 204

    # After logout, /me should fail.
    me = await auth_client.get("/auth/me")
    assert me.status_code == 401
