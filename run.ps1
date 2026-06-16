# Поднять весь стек (postgres + api + web) одной командой.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "-> создан .env из .env.example"
}

Write-Host "-> сборка и запуск (веб :5173, api :8000)..."
docker compose up --build
