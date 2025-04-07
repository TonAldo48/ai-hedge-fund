FROM python:3.11-slim

WORKDIR /app

# Copy everything first to ensure requirements.txt is found
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"] 