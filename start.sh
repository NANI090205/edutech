#!/bin/bash

echo "==================================================="
echo "  Starting Student Course Management System"
echo "==================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js (https://nodejs.org) and try again."
    exit 1
fi

# Check Java
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed or not in PATH."
    echo "Please install JDK 17 or higher and try again."
    exit 1
fi

# Load environment variables from .env
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found."
    echo "Please copy .env.example to .env and configure your variables."
    exit 1
fi

echo "Loading environment variables from .env..."
export $(grep -v '^#' .env | xargs)

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo "[INFO] Installing frontend dependencies. This may take a moment..."
    cd frontend && npm install && cd ..
fi

# Start Backend using Maven Wrapper
echo "[INFO] Launching backend application..."
cd backend
chmod +x mvnw
./mvnw spring-boot:run &
cd ..

# Wait until backend is ready (port 8080 is open)
echo "Waiting for backend port 8080 to become active..."
until curl -s http://localhost:8080 > /dev/null; do
    sleep 2
done
echo "[SUCCESS] Backend is ready!"

# Start Frontend
echo "[INFO] Launching React frontend..."
cd frontend
npm start &
cd ..

echo "==================================================="
echo "  System started successfully!"
echo "  React App: http://localhost:3000"
echo "  Spring Boot App: http://localhost:8080"
echo "==================================================="
