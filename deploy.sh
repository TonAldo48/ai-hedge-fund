#!/bin/bash
# AI Hedge Fund Deployment Script
# This script prepares the application for deployment by building the frontend
# and checking that all necessary files and environment variables are in place.

# Exit on error
set -e

echo "===== AI Hedge Fund Deployment Preparation Script ====="
echo "This script will prepare your application for deployment."

# Check for required tools
echo -n "Checking for required tools... "
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi
echo "OK"

# Check for .env files
echo -n "Checking for environment files... "
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found for backend. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env file for backend from example. Please update with your actual API keys."
    else
        echo "ERROR: .env.example file not found. Please create a .env file for the backend."
        exit 1
    fi
else
    echo "OK"
fi

echo -n "Checking frontend environment files... "
if [ ! -f "web/.env.local" ]; then
    echo "WARNING: .env.local not found for frontend. Creating..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > web/.env.local
    echo "Created .env.local file for frontend. Please update with your actual backend API URL."
else
    echo "OK"
fi

# Build frontend
echo "Building frontend application..."
cd web
npm install --legacy-peer-deps
npm run build
cd ..
echo "Frontend build complete."

# Check backend requirements
echo "Checking backend requirements..."
pip3 install -r requirements.txt
echo "Backend requirements satisfied."

# Create deployment package
echo "Creating deployment package..."
mkdir -p deploy
cp -r web/.next deploy/frontend
cp -r src deploy/backend
cp requirements.txt deploy/
cp Dockerfile deploy/
cp Procfile deploy/
cp -r data deploy/data
cp deployment-env-examples.md deploy/

echo "===== Deployment package created in ./deploy directory ====="
echo "You can now deploy the application using:"
echo "1. Vercel for the frontend"
echo "2. Railway/Render for the backend"
echo "See DEPLOYMENT.md for detailed instructions."

echo "Would you like to zip the deployment package? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    zip -r deploy.zip deploy
    echo "Deployment package zipped to deploy.zip"
fi

echo "Deployment preparation complete!" 