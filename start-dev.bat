@echo off
title ChildGuard AI — Launching Full Stack
echo =======================================================
echo          CHILDGUARD AI - DEVELOPMENT LAUNCHER
echo          PRISMTECH 2026 - Social Stream
echo =======================================================
echo.

echo [1/2] Starting ChildGuard AI FastAPI Backend on http://localhost:8000 ...
start "ChildGuard Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting ChildGuard AI React Frontend on http://localhost:5173 ...
start "ChildGuard Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo ChildGuard AI is running!
echo Frontend Dashboard: http://localhost:5173
echo Backend API Docs:   http://localhost:8000/docs
echo WebSocket Alerts:   ws://localhost:8000/ws/alerts
echo =======================================================
echo Press any key to close this launcher window (services will stay running).
pause >nul
