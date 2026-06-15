# minitask

A small Linear-style task manager built as a test assignment. Email/password auth,
a three-lane board (todo / in progress / done), priority, deadline and a description
field. The session stays on the device through an httpOnly cookie, so signing in
is a one-time thing.
 
```
              ┌─────────────────────────────┐
              │           web               │
              │   React + Vite + Tailwind   │
              │   served by nginx (5173)    │
              └─────────────┬───────────────┘
                            │ httpOnly cookie
                            ▼
              ┌─────────────────────────────┐
              │            api              │
              │  FastAPI + SQLAlchemy 2     │
              │       async (8000)          │
              └─────────────┬───────────────┘
                            │ asyncpg
                            ▼
              ┌─────────────────────────────┐
              │         postgres 16         │
              └─────────────────────────────┘
```

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- web: <http://localhost:5173>
- api: <http://localhost:8000> (OpenAPI at `/docs`)
- postgres exposed on `5433` so it does not collide with a system Postgres

`alembic upgrade head` runs automatically when the api container starts, so the
schema is ready by the time the web bundle hits the api.

## Architecture

Two services with a thin contract between them:

- **api** — FastAPI app split into `routers/` (HTTP shape), `schemas/` (pydantic
  request/response), `models.py` (SQLAlchemy ORM), `security.py` (bcrypt + JWT),
  `deps.py` (auth dependency). Settings are typed via `pydantic-settings` and read
  from env at startup. The async SQLAlchemy session is yielded per request via
  `get_db`.
- **web** — Vite + React 18 (JSX, no TypeScript per the brief). Two views —
  `AuthView` and `BoardView` — gated by a tiny zustand auth store that asks the
  api whether the cookie is still valid on mount. Task state is owned by a
  `useTasks` hook that wraps the api client. Motion is on `motion/react`, the
  current name for the library that used to be `framer-motion`.

I chose a single auth-gated component over a router because there are only two
views; the cost of `react-router` here is more than the value. The board and the
auth screen don't share routes, and there are no deep links to a single task.

## Security model

What the brief said it would grade, and how it's covered:

- **Passwords** — bcrypt via passlib, cost 12. Schema enforces 8–72 characters
  (72 is bcrypt's hard byte limit; explicit cap beats silently truncating).
- **Session** — JWT in an `httpOnly`, `SameSite=Lax` cookie. The web bundle
  never touches the token, which removes a class of XSS exfiltration. Cookies
  flip to `Secure` in production via env. Default TTL is 30 days; for prod
  rotate to a 15-minute access token plus a refresh token (out of scope here).
- **Login error parity** — wrong password and unknown email return the same
  401 with the same body, so an attacker can't enumerate accounts.
- **Registration conflict** — duplicate email returns 409 with a generic
  message, no field-level detail.
- **Authorization** — every `/tasks` endpoint resolves the current user from
  the cookie and filters the query by `owner_id`. A request for somebody
  else's task id returns 404, never 403 — so the response can't be used to
  probe which ids exist.
- **Rate limiting** — slowapi caps `/auth/register` at 5/min and `/auth/login`
  at 10/min per remote address. In-memory backend; point at Redis for
  multi-replica.
- **Input validation** — pydantic v2 with `EmailStr`, length bounds on every
  string field, enum types for status and priority. Anything malformed is a
  422 before it reaches the handler.
- **SQL injection** — parameterised through SQLAlchemy by default; there is no
  raw SQL in the app code.
- **CORS** — restricted to the configured origin list with credentials enabled
  (cookies require it). Methods and headers are explicit, not wildcards.
- **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  DENY`, `Referrer-Policy: strict-origin-when-cross-origin` set both at the
  API middleware layer and on the nginx serving the web bundle.

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
│   │   ├── limiter.py          slowapi instance
│   │   ├── main.py             app factory, CORS, headers
│   │   ├── models.py           User, Task
│   │   └── security.py         bcrypt + JWT
│   ├── tests/                  pytest + httpx async client
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── pyproject.toml          ruff + pytest config
│   └── requirements*.txt
├── web/
│   ├── src/
│   │   ├── api/client.js       fetch wrapper with credentials
│   │   ├── components/
│   │   │   ├── board/          StatsPanel, StatusColumn, TaskCard, TaskDialog
│   │   │   └── ui/             Button, Input
│   │   ├── hooks/useTasks.js   list + CRUD
│   │   ├── lib/format.js       date + deadline helpers
│   │   ├── stores/auth.js      zustand auth state
│   │   ├── views/              AuthView, BoardView
│   │   ├── App.jsx             auth gate
│   │   ├── main.jsx
│   │   └── index.css           tailwind + tokens
│   ├── Dockerfile              multi-stage build → nginx
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
└── docker-compose.yml
```

## Local development without Docker

```bash
# api
cd api
python -m venv .venv && source .venv/bin/activate   # or .venv/Scripts/Activate.ps1 on Windows
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+asyncpg://...        # point at any postgres
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# web (separate terminal)
cd web
npm install
npm run dev
```

## Tests

```bash
cd api
# tests rely on an isolated database — defaults to localhost:5433/minitask_test
TEST_DATABASE_URL=postgresql+asyncpg://minitask:minitask@localhost:5433/minitask_test \
  pytest -q
```

Covered: register/login/me/logout flow, identical 401 for unknown email and wrong
password, partial PATCH (status change preserves description), cross-user 404 on
foreign task ids.

## Design

A warm cream surface (`#f8f4ee`) instead of a clinical white, a single teal
accent for actions, amber kept exclusively for one signal (overdue + high
priority). Fraunces for the display headline and counters, Manrope for UI,
JetBrains Mono for eyebrows. The board uses an asymmetric two-column split on
desktop and stacks on mobile.

Motion is intentional, not decorative: cards `layout`-animate when status
changes so re-grouping reads as movement; the dialog enters as a bottom sheet
on mobile and a centred modal on desktop, both via `AnimatePresence`. Reduced
motion is respected via a global media query.

## Decisions I'd revisit for production

- **Refresh tokens** — current setup uses one 30-day cookie. A real deploy
  should split this into a short access token (15 min) and a refresh token
  rotation, with the refresh stored separately.
- **Drag-and-drop** — moving tasks between lanes is done through explicit
  chevrons. HTML5 DnD is fine but doesn't feel right on touch; `dnd-kit` would
  be the next step if drag is important.
- **Optimistic updates** — the UI currently waits for the api response on every
  mutation. For a snappier feel, mutations could apply locally first and roll
  back on error. Skipped here so behaviour is easy to reason about.
- **Email verification** — registration is single-step. A real product gates
  account activation on a confirmation link.
- **Audit log + soft delete** — tasks are hard-deleted. For anything that needs
  a history (most products do), keep them and flip a `deleted_at` instead.
