FROM python:3.11-slim

# Install system dependencies that might be needed for certain Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything first
COPY . /app/

# Debug - see what we have
RUN find /app -name "requirements.txt" -type f
RUN ls -la /app/

# Install dependencies with verbose output
RUN pip install --upgrade pip && \
    pip install --verbose --no-cache-dir -r /app/requirements.txt || echo "Failed to install from requirements.txt"

# Ensure uvicorn is installed
RUN pip install uvicorn fastapi

# Verify uvicorn is installed and in the path
RUN which uvicorn || echo "uvicorn not found in PATH"

# Expose the port
EXPOSE 8000

# Command to run the application - using shell form to evaluate environment variables
CMD uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000} 