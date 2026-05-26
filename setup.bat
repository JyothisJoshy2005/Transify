@echo off
title Transify AI - Full Setup
color 0E
echo.
echo  ==========================================
echo    Transify AI - First-Time Setup
echo  ==========================================
echo.

:: ── Backend Setup ──────────────────────────
echo [1/4] Creating Python virtual environment...
cd /d "%~dp0backend"
py -m venv venv
if errorlevel 1 (
    echo  ERROR: Python not found. Install from https://python.org
    pause & exit /b 1
)
echo  [OK] Virtual environment created.

echo.
echo [2/4] Installing Python dependencies (this may take a few minutes)...
call venv\Scripts\pip install --upgrade pip -q
call venv\Scripts\pip install -r requirements.txt
if errorlevel 1 (
    echo  ERROR: pip install failed. Check your internet connection.
    pause & exit /b 1
)
echo  [OK] Python packages installed.

:: ── Frontend Setup ──────────────────────────
echo.
echo [3/4] Installing Node.js dependencies...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo  ERROR: npm install failed. Check Node.js is installed.
    pause & exit /b 1
)
echo  [OK] Node packages installed.

echo.
echo [4/4] Setup complete!
echo.
echo  ==========================================
echo    HOW TO START:
echo    1. Double-click start_backend.bat
echo    2. Double-click start_frontend.bat
echo    3. Open http://localhost:5173
echo  ==========================================
echo.
echo  NOTE: First translation will download a ~300MB AI model.
echo  Subsequent translations work fully offline.
echo.
pause
