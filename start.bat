@echo off
setlocal enabledelayedexpansion

:: Add System32 to PATH to ensure standard utilities are available
set "PATH=%PATH%;%SystemRoot%\System32"

echo ===================================================
echo   Starting Student Course Management System
echo ===================================================

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

:: Check Java
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo Please install JDK 17 or higher and try again.
    pause
    exit /b 1
)

:: Load environment variables from .env
if not exist .env (
    echo [ERROR] .env file not found.
    echo Please copy .env.example to .env and configure your variables.
    pause
    exit /b 1
)

echo Loading environment variables from .env...
for /f "usebackq delims=" %%a in (".env") do (
    set "line=%%a"
    if "!line:~0,1!" neq "#" (
        for /f "tokens=1,* delims==" %%i in ("!line!") do (
            set "key=%%i"
            set "val=%%j"
            if defined val (
                :: Strip quotes
                set "val=!val:"=!"
                set "val=!val:'=!"
                set "!key!=!val!"
            )
        )
    )
)

:: Export the loaded environment variables to child processes securely with quotes
set "MONGODB_URI=%MONGODB_URI%"
set "JWT_SECRET=%JWT_SECRET%"
set "JWT_EXPIRATION=%JWT_EXPIRATION%"

:: Install frontend dependencies if node_modules doesn't exist
if not exist frontend\node_modules (
    echo [INFO] Installing frontend dependencies. This may take a moment...
    cd frontend
    call npm install
    cd ..
)

:: Start Backend using Maven Wrapper
echo [INFO] Launching backend application in background...
cd backend
start "Backend Service" cmd /c "mvnw.cmd spring-boot:run"
cd ..

:: Wait until backend is ready (port 8080 is open) using a robust PowerShell wait loop
echo Waiting for backend port 8080 to become active...
powershell -Command "while ($true) { try { $socket = New-Object System.Net.Sockets.TcpClient('localhost', 8080); $socket.Close(); break } catch { Start-Sleep -Seconds 2 } }"
echo [SUCCESS] Backend is ready!

:: Start Frontend
echo [INFO] Launching React frontend...
cd frontend
start "Frontend UI" cmd /c "npm start"
cd ..

echo ===================================================
echo   System started successfully!
echo   React App: http://localhost:3000
echo   Spring Boot App: http://localhost:8080
echo ===================================================
