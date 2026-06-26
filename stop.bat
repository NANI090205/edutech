@echo off
:: Add System32 to PATH to ensure standard utilities are available
set "PATH=%PATH%;%SystemRoot%\System32"

echo ===================================================
echo   Stopping Student Course Management System
echo ===================================================

:: Find and kill process on port 8080 (Backend)
echo Checking port 8080 for running backend service...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo [INFO] Killing backend process with PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: Find and kill process on port 3000 (Frontend)
echo Checking port 3000 for running frontend service...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [INFO] Killing frontend process with PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo [SUCCESS] Application stopped successfully.
echo ===================================================
