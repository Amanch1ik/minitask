#!/usr/bin/env bash
# Start the whole stack (postgres + api + web) with one command.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ created .env from .env.example"
fi

echo "→ building and starting (web :5173, api :8000)…"
docker compose up --build
