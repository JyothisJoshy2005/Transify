@echo off
title Transify AI - Backend Server
color 0A
echo.
echo  ==========================================
echo    Transify AI - Backend Starting...
echo  ==========================================
echo.

cd /d "%~dp0backend"

:: Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo  [OK] Virtual environment activated
) else (
    echo  [WARN] No venv found - run setup.bat first
    pause & exit /b 1
)

echo  [INFO] Starting Flask server on http://localhost:5000
echo  [INFO] Press Ctrl+C to stop
echo  [INFO] First translation will download AI model (~300MB)
echo.
python app.py
pause
