# Start the whole stack (postgres + api + web) with one command.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "-> created .env from .env.example"
}

Write-Host "-> building and starting (web :5173, api :8000)..."
docker compose up --build
