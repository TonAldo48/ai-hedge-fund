FROM python:3.11-slim

# Install system dependencies that might be needed for certain Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# List directory contents to debug
RUN ls -la

# Copy everything first
COPY . /app/

# List directory contents after copy to verify requirements.txt exists
RUN ls -la /app/
RUN cat /app/requirements.txt

# Install dependencies with verbose output
RUN pip install --upgrade pip && \
    pip install --verbose --no-cache-dir -r /app/requirements.txt

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"] 