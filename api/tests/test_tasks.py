from httpx import AsyncClient


async def test_create_task_minimum_payload(auth_client: AsyncClient):
    resp = await auth_client.post("/tasks", json={"title": "Write README"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Write README"
    assert body["status"] == "todo"
    assert body["priority"] == "medium"
    assert body["description"] is None
    assert body["deadline"] is None


async def test_create_task_with_full_payload(auth_client: AsyncClient):
    resp = await auth_client.post(
        "/tasks",
        json={
            "title": "Ship MVP",
            "description": "End-to-end walkthrough",
            "priority": "high",
            "status": "in_progress",
            "deadline": "2026-06-30T18:00:00Z",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["priority"] == "high"
    assert body["status"] == "in_progress"


async def test_list_returns_only_my_tasks(client: AsyncClient):
    # User A
    await client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "supersecret"},
    )
    await client.post("/tasks", json={"title": "A's task"})

    # User B (new cookie, replaces A's)
    client.cookies.clear()
    await client.post(
        "/auth/register",
        json={"email": "b@example.com", "password": "supersecret"},
    )
    await client.post("/tasks", json={"title": "B's task"})

    resp = await client.get("/tasks")
    assert resp.status_code == 200
    titles = [t["title"] for t in resp.json()]
    assert titles == ["B's task"]


async def test_update_status_keeps_other_fields(auth_client: AsyncClient):
    created = await auth_client.post(
        "/tasks",
        json={"title": "Refactor module", "description": "split into 3"},
    )
    task_id = created.json()["id"]

    resp = await auth_client.patch(f"/tasks/{task_id}", json={"status": "done"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "done"
    assert body["description"] == "split into 3"
    assert body["title"] == "Refactor module"


async def test_other_users_task_returns_404(client: AsyncClient):
    # A creates a task
    await client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "supersecret"},
    )
    created = await client.post("/tasks", json={"title": "Private"})
    task_id = created.json()["id"]

    # B logs in
    client.cookies.clear()
    await client.post(
        "/auth/register",
        json={"email": "outsider@example.com", "password": "supersecret"},
    )

    # 404, not 403 — id existence must stay hidden.
    resp = await client.get(f"/tasks/{task_id}")
    assert resp.status_code == 404
    patch = await client.patch(f"/tasks/{task_id}", json={"status": "done"})
    assert patch.status_code == 404
    delete = await client.delete(f"/tasks/{task_id}")
    assert delete.status_code == 404


async def test_delete_removes_task(auth_client: AsyncClient):
    created = await auth_client.post("/tasks", json={"title": "Throwaway"})
    task_id = created.json()["id"]

    resp = await auth_client.delete(f"/tasks/{task_id}")
    assert resp.status_code == 204

    after = await auth_client.get(f"/tasks/{task_id}")
    assert after.status_code == 404


async def test_tasks_require_auth(client: AsyncClient):
    assert (await client.get("/tasks")).status_code == 401
    assert (await client.post("/tasks", json={"title": "x"})).status_code == 401
