import pytest
from httpx import AsyncClient

from tests.conftest import reset_token_for, verify_token_for


async def test_register_returns_message_and_no_session(client: AsyncClient):
    resp = await client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 201
    assert resp.json()["message"]

    # Registration no longer logs you in — the account is locked until the
    # email is confirmed, so no session cookie is issued.
    assert "minitask_session=" not in resp.headers.get("set-cookie", "")


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


async def test_me_returns_null_without_session(client: AsyncClient):
    # No session is a normal state, not an error — `/auth/me` answers 200 with
    # a null body so the frontend boot probe never triggers a console 401.
    resp = await client.get("/auth/me")
    assert resp.status_code == 200
    assert resp.json() is None


async def test_me_returns_current_user(auth_client: AsyncClient):
    resp = await auth_client.get("/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "alice@example.com"


async def test_logout_clears_cookie(auth_client: AsyncClient):
    resp = await auth_client.post("/auth/logout")
    assert resp.status_code == 204

    # After logout, /me reports "nobody" — 200 with a null body.
    me = await auth_client.get("/auth/me")
    assert me.status_code == 200
    assert me.json() is None


# --- email verification ---------------------------------------------------


async def test_login_blocked_until_verified(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={"email": "unverified@example.com", "password": "supersecret"},
    )
    resp = await client.post(
        "/auth/login",
        json={"email": "unverified@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Email not verified"
    assert "minitask_session=" not in resp.headers.get("set-cookie", "")


async def test_verify_confirms_and_logs_in(client: AsyncClient):
    email = "newbie@example.com"
    await client.post("/auth/register", json={"email": email, "password": "supersecret"})

    resp = await client.post("/auth/verify", json={"token": await verify_token_for(email)})
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == email
    assert body["is_verified"] is True
    assert resp.cookies.get("minitask_session")


async def test_verify_rejects_bad_token(client: AsyncClient):
    resp = await client.post("/auth/verify", json={"token": "not-a-real-token"})
    assert resp.status_code == 400


async def test_resend_verification_is_generic(client: AsyncClient):
    # Unknown address must not reveal whether it exists.
    resp = await client.post(
        "/auth/resend-verification", json={"email": "ghost@example.com"}
    )
    assert resp.status_code == 200
    assert resp.json()["message"]


# --- password reset -------------------------------------------------------


async def test_forgot_password_is_generic(client: AsyncClient):
    resp = await client.post("/auth/forgot-password", json={"email": "ghost@example.com"})
    assert resp.status_code == 200
    assert resp.json()["message"]


async def test_reset_password_flow(auth_client: AsyncClient):
    email = "alice@example.com"
    token = await reset_token_for(email)

    reset = await auth_client.post(
        "/auth/reset-password", json={"token": token, "password": "brandnewsecret"}
    )
    assert reset.status_code == 200
    # Reset logs the user straight in.
    assert reset.json()["email"] == email
    assert reset.cookies.get("minitask_session")

    auth_client.cookies.clear()

    # New password works.
    ok = await auth_client.post(
        "/auth/login", json={"email": email, "password": "brandnewsecret"}
    )
    assert ok.status_code == 200

    # Old password no longer works.
    bad = await auth_client.post(
        "/auth/login", json={"email": email, "password": "supersecret"}
    )
    assert bad.status_code == 401


async def test_reset_token_is_single_use(auth_client: AsyncClient):
    email = "alice@example.com"
    token = await reset_token_for(email)

    first = await auth_client.post(
        "/auth/reset-password", json={"token": token, "password": "firstnewsecret"}
    )
    assert first.status_code == 200

    # The same token is now bound to the old password hash — reuse must fail.
    second = await auth_client.post(
        "/auth/reset-password", json={"token": token, "password": "secondnewsecret"}
    )
    assert second.status_code == 400
