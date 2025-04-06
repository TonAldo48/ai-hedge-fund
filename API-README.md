# AI Hedge Fund API Integration

This document describes the FastAPI backend implementation for the AI Hedge Fund web application.

## Overview

The API server provides endpoints for:
- Running trading simulations
- Managing saved simulations
- Fetching stock data and history
- Managing custom agents/analysts
- Accessing portfolio information

## Setup

### Prerequisites

- Python 3.9+
- Poetry package manager

### Installation

```bash
# Install dependencies
poetry install

# Run the API server
poetry run start-api
```

By default, the server runs on `http://localhost:8000`.

### Configuration Options

You can configure the API server with the following command-line options:

```bash
# Start on a specific host and port
poetry run start-api --host 127.0.0.1 --port 8080

# Allow additional origins for CORS
poetry run start-api --allowed-origins "https://example.com,https://app.example.com"
```

### Version Requirements

The API uses the following key packages:
- FastAPI v0.115.0 or newer
- Uvicorn v0.29.0 or newer
- Pydantic v2.6.0 or newer

If you experience issues with older or newer versions, you can specify exact versions in your environment:

```bash
# Using pip
pip install fastapi==0.115.0 uvicorn==0.29.0 pydantic==2.6.0

# Using poetry
poetry add fastapi@0.115.0 uvicorn@0.29.0 pydantic@2.6.0
```

## API Endpoints

### Simulation

- `POST /api/simulation/run` - Run a trading simulation
- `GET /api/simulations` - Get all saved simulations
- `POST /api/simulations` - Save a simulation
- `GET /api/simulations/{id}` - Get a specific simulation
- `PUT /api/simulations/{id}` - Update a simulation
- `DELETE /api/simulations/{id}` - Delete a simulation

### Stocks

- `GET /api/stocks` - Get a list of stocks
- `GET /api/stocks/{symbol}` - Get stock details
- `GET /api/stocks/{symbol}/history` - Get price history for a stock
- `GET /api/stocks/{symbol}/insights` - Get analyst insights for a stock

### Portfolio

- `GET /api/portfolio` - Get portfolio data

### Agents

- `GET /api/agents` - Get all custom agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/{id}` - Get a specific agent
- `PUT /api/agents/{id}` - Update an agent
- `DELETE /api/agents/{id}` - Delete an agent

## Data Storage

The API server stores data in JSON files in the `data/` directory:
- `simulations.json` - Saved simulations
- `agents.json` - Custom agents

## Development

### Mock Data

The current implementation uses mock data for development purposes. In a production environment, these would be replaced with:
- Real stock data from financial APIs
- Database storage for simulations and agents
- Integration with the actual hedge fund algorithm

### Swagger Documentation

API documentation is automatically available at `http://localhost:8000/docs` when the server is running.

### Testing the API

You can use the included test script to verify the API functionality:

```bash
# Start the API server in one terminal
poetry run start-api

# Run the test script in another terminal
python test_api.py
```

## Next Steps

1. Refactor the main hedge fund code to be callable from the API
2. Add authentication and user management
3. Implement real-time updates via WebSockets for long-running simulations
4. Connect to actual financial data sources

## Testing the API

You can test the API using curl or any API testing tool:

```bash
# Get all stocks
curl http://localhost:8000/api/stocks

# Get stock details
curl http://localhost:8000/api/stocks/AAPL

# Run a simulation
curl -X POST http://localhost:8000/api/simulation/run \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "startDate": "2023-01-01",
    "endDate": "2023-06-30",
    "initialCash": 10000,
    "marginRequirement": 0,
    "model": "default",
    "showReasoning": true,
    "analyst": "warren_buffett"
  }'
``` 