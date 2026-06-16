# minitask

A task board with email/password auth and a clean, Asana-style board. Drag tasks
between lanes, add them inline, group them into projects, and switch between
board / today / calendar / archive views. Sessions live in an httpOnly cookie, so
signing in is a one-time thing.

```
              ┌─────────────────────────────┐
              │            web              │
              │   React + Vite + Tailwind   │
              │    served by nginx (5173)   │
              └─────────────┬───────────────┘
                            │ httpOnly cookie
                            ▼
              ┌─────────────────────────────┐
              │            api              │
              │   FastAPI + SQLAlchemy 2    │
              │       async (8000)          │
              └─────────────┬───────────────┘
                            │ asyncpg
                            ▼
              ┌─────────────────────────────┐
              │         postgres 16         │
              └─────────────────────────────┘
```

## Run it (one command)

You need Docker. From the project root:

```bash
cp .env.example .env
docker compose up --build
```

Or use the helper script, which copies `.env` for you and starts everything:

```bash
./run.sh        # macOS / Linux / Git Bash
./run.ps1       # Windows PowerShell
```

Then open:

- **web** → <http://localhost:5173>
- **api** → <http://localhost:8000> (OpenAPI docs at `/docs`)
- postgres is exposed on `5433` so it won't clash with a local Postgres.

Migrations (`alembic upgrade head`) run automatically when the api container
starts, so the schema is ready before the web bundle talks to the api.

### Confirming your account in local dev

Registration sends a verification email. In local dev there's **no SMTP
configured**, so instead of emailing, the api **prints the verification link to
its log**. Grab it from there:

```bash
docker compose logs api | grep -i verify
```

Open that link in the browser (it points at `http://localhost:5173/verify?...`)
to confirm the account, then log in. To send real mail instead, fill in the
`SMTP_*` values in `.env` (a free Gmail app password works).

## Features

| Area | What's there |
|------|--------------|
| Auth | Register, login, logout, email verification, password reset — all over an httpOnly cookie session |
| Board | Three lanes (todo / in progress / done) with drag-and-drop between them |
| Tasks | Title, description, priority, deadline, status; inline quick-add per column or a full dialog |
| Views | Board, Today (overdue + due today), Calendar (month grid), Archive (completed) |
| Projects | Lightweight grouping/filter (Personal / Work / Study) assignable from the task dialog |
| Responsive | Sidebar collapses into a slide-in drawer on mobile; the dialog adapts to the viewport |

## Local development (without Docker)

```bash
# api
cd api
python -m venv .venv && source .venv/bin/activate   # .venv/Scripts/Activate.ps1 on Windows
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+asyncpg://minitask:minitask@localhost:5432/minitask
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# web (separate terminal)
cd web
npm install
npm run dev
```

The web dev server prints the local URL it picked (Vite). Point your browser there.

## Architecture

Two services with a thin contract between them.

- **api** — FastAPI split into `routers/` (HTTP shape), `schemas/` (pydantic
  request/response), `models.py` (SQLAlchemy ORM), `security.py` (bcrypt + JWT),
  `deps.py` (the auth dependency). Settings are typed via `pydantic-settings` and
  read from the environment at startup. The async SQLAlchemy session is yielded
  per request through `get_db`.
- **web** — Vite + React 18 (JSX, no TypeScript). A small zustand store gates the
  app behind auth and checks the cookie on mount; server state lives in a
  `useTasks` hook over a thin fetch client. Projects are a client-side grouping
  layer persisted in `localStorage` — the task model itself stays minimal.
  Animation uses `motion/react`.

## Security model

- **Passwords** — bcrypt via passlib, cost 12. Schema enforces 8–72 characters
  (72 is bcrypt's hard byte limit).
- **Session** — JWT in an `httpOnly`, `SameSite=Lax` cookie. The web bundle never
  touches the token, which removes a class of XSS exfiltration. Cookies flip to
  `Secure` in production via env.
- **Login error parity** — wrong password and unknown email return the same 401
  with the same body, so accounts can't be enumerated.
- **Registration conflict** — duplicate email returns 409 with a generic message.
- **Email verification** — accounts are locked until the emailed link is
  confirmed; login on an unverified account returns 403.
- **Authorization** — every `/tasks` endpoint resolves the current user from the
  cookie and filters by `owner_id`. A request for someone else's task id returns
  404, never 403, so the response can't probe which ids exist.
- **Rate limiting** — slowapi caps `/auth/register` at 5/min and `/auth/login` at
  10/min per address.
- **Input validation** — pydantic v2 with `EmailStr`, length bounds on every
  string field, enums for status and priority; malformed input is a 422 before it
  reaches the handler.
- **SQL injection** — parameterised through SQLAlchemy; no raw SQL in app code.
- **CORS** — restricted to the configured origin list with credentials enabled;
  explicit methods and headers, no wildcards.
- **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  DENY`, `Referrer-Policy: strict-origin-when-cross-origin` at both the API
  middleware and the nginx layer.

## Tests

```bash
cd api
TEST_DATABASE_URL=postgresql+asyncpg://minitask:minitask@localhost:5433/minitask_test \
  pytest -q
```

Covers the register/login/me/logout flow, identical 401 for unknown email and
wrong password, partial PATCH (a status change preserves the description), and a
cross-user 404 on a foreign task id.

## Project layout

```
.
├── api/
│   ├── alembic/                migrations
│   ├── app/
│   │   ├── routers/            auth.py, tasks.py
│   │   ├── schemas/            pydantic request/response
│   │   ├── config.py           env-typed settings
│   │   ├── db.py               async engine + session
│   │   ├── deps.py             get_current_user
│   │   ├── email.py            verification / reset mail (SMTP + dev console)
│   │   ├── limiter.py          slowapi instance
│   │   ├── main.py             app factory, CORS, headers
│   │   ├── models.py           User, Task
│   │   └── security.py         bcrypt + JWT
│   ├── tests/                  pytest + httpx async client
│   ├── Dockerfile
│   └── requirements*.txt
├── web/
│   ├── src/
│   │   ├── api/client.js       fetch wrapper with credentials
│   │   ├── components/
│   │   │   ├── board/          StatusColumn, TaskCard, TaskRow, TaskDialog
│   │   │   ├── views/          TodayView, CalendarView, ArchiveView
│   │   │   ├── layout/         Sidebar, TopBar
│   │   │   └── ui/             Button, Input, Avatar, …
│   │   ├── hooks/              useTasks, useDismiss
│   │   ├── lib/                format.js, projects.js
│   │   ├── stores/auth.js      zustand auth state
│   │   └── views/              AuthView, BoardView
│   ├── Dockerfile              multi-stage build → nginx
│   └── nginx.conf
├── .env.example
├── docker-compose.yml
├── run.sh
└── run.ps1
```

## Notes for production

- Split the single 30-day cookie into a short access token plus a refresh token.
- Move rate limiting and any caching to Redis for multi-replica deploys.
- Set `PUBLIC_WEB_URL` to the real domain so email links resolve off-machine, and
  configure real SMTP.
