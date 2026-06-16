#!/usr/bin/env bash
# Поднять весь стек (postgres + api + web) одной командой.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "-> создан .env из .env.example"
fi

echo "-> сборка и запуск (веб :5173, api :8000)..."
docker compose up --build
