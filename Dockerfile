FROM python:3.11-slim

WORKDIR /app

# List directory contents to debug
RUN ls -la

# Copy everything first
COPY . /app/

# List directory contents after copy to verify requirements.txt exists
RUN ls -la /app/

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"] 