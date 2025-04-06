#!/bin/bash

# Start both frontend and backend for local development
# Frontend runs on port 3000, backend on port 8000

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AI Hedge Fund development environment...${NC}"

# Start the backend API in the background
echo -e "${BLUE}Starting backend API on port 8000...${NC}"
cd "$(dirname "$0")"
python src/start_api.py --port 8000 &
BACKEND_PID=$!

# Give the backend a moment to start up
sleep 2

# Start the frontend
echo -e "${BLUE}Starting frontend on port 3000...${NC}"
cd web
npm run dev

# When the frontend is stopped (Ctrl+C), also stop the backend
echo -e "${GREEN}Shutting down backend process (PID: $BACKEND_PID)...${NC}"
kill $BACKEND_PID 