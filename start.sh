#!/bin/bash

# Exit script if any command fails
set -e

echo "Starting Urban Flood Nowcasting Dashboard..."

# Activate Python virtual environment (if it exists, e.g. in Docker)
if [ -d "/opt/venv" ]; then
    source /opt/venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start FastAPI server in the background
echo "Starting FastAPI ML Engine..."
uvicorn api.main:app --host 127.0.0.1 --port 8000 &

# Start Next.js frontend in the foreground
echo "Starting Next.js..."
npm start
