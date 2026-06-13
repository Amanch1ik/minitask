# minitask

A small task manager built as a test assignment. Linear-style board with auth, three statuses,
priority and deadline. Stack is FastAPI + Postgres on the API side and React + Vite on the web
side, all wired together with docker compose.

The detailed README — architecture, security model, decisions log — lands in the final docs
commit. This placeholder exists so the repo has a sensible landing from the first commit.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:8000 (docs at `/docs`)
- Web: http://localhost:5173
