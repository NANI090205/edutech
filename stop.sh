#!/bin/bash
echo "==================================================="
echo "  Stopping Student Course Management System"
echo "==================================================="

# Kill process on port 8080
PID_8080=$(lsof -t -i:8080)
if [ ! -z "$PID_8080" ]; then
    echo "[INFO] Killing backend process $PID_8080..."
    kill -9 $PID_8080
fi

# Kill process on port 3000
PID_3000=$(lsof -t -i:3000)
if [ ! -z "$PID_3000" ]; then
    echo "[INFO] Killing frontend process $PID_3000..."
    kill -9 $PID_3000
fi

echo "[SUCCESS] Application stopped successfully."
echo "==================================================="
