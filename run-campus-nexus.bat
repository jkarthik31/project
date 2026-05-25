@echo off
TITLE Campus Nexus - Automatic Startup
COLOR 0A

:: Get the directory of the script
SET PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

echo ==========================================
echo    CAMPUS NEXUS - STARTING SERVICES
echo ==========================================
echo Project Root: %PROJECT_ROOT%

:: Start Backend
echo.
echo [1/3] Starting Backend Server (Port 5000)...
start "Campus Nexus Backend" cmd /k "cd /d "%PROJECT_ROOT%backend" && npm start"

:: Start React Frontend (Main App)
echo.
echo [2/3] Starting React Frontend (Port 5173)...
start "Campus Nexus App" cmd /k "cd /d "%PROJECT_ROOT%react-frontend" && npm run dev"

:: Start Landing Page
echo.
echo [3/3] Starting Landing Page (Port 3001)...
start "Campus Nexus Landing" cmd /k "cd /d "%PROJECT_ROOT%landing-page" && npm run dev"

echo.
echo ==========================================
echo    SERVICES ARE STARTING IN NEW WINDOWS
echo ==========================================
echo.
echo Opening Landing Page in 12 seconds...
timeout /t 12
start http://localhost:3001
