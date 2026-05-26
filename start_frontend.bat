@echo off
title Transify AI - Frontend Server
color 0B
echo.
echo  ==========================================
echo    Transify AI - Frontend Starting...
echo  ==========================================
echo.

cd /d "%~dp0frontend"

echo  [INFO] Starting React dev server on http://localhost:5173
echo  [INFO] Press Ctrl+C to stop
echo.
npm run dev
pause
