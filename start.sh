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
# If we're in production use npm start, otherwise npm run dev
if [ "$NODE_ENV" = "production" ]; then
  npm run build
  npm start
else
  npm run dev
fi
