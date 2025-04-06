# Testing the AI Hedge Fund API Integration

This document explains how to test the API integration between the Next.js frontend and FastAPI backend.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Poetry package manager
- npm or yarn

## Step 1: Install Dependencies

```bash
# Install Python dependencies
poetry install

# Install Next.js dependencies
cd web
npm install  # or yarn
cd ..
```

## Step 2: Start the FastAPI Backend

```bash
# Start the FastAPI server
poetry run python src/start_api.py
```

This will start the server on http://localhost:8000. You can access the API documentation at http://localhost:8000/docs.

## Step 3: Start the Next.js Frontend (Optional for full integration testing)

```bash
# In a new terminal window
cd web
npm run dev  # or yarn dev
```

This will start the Next.js development server on http://localhost:3000.

## Step 4: Run the Basic API Tests

To test if the FastAPI backend is working correctly:

```bash
# Test the FastAPI endpoints
python test_api.py
```

This will test all backend API endpoints and data storage.

## Step 5: Test the Next.js API Routes (Optional)

To test if the Next.js API routes are correctly proxying requests to the FastAPI backend:

```bash
# Test the Next.js API routes
python web_api_test.py
```

This requires both the FastAPI server and Next.js server to be running.

## Manual Testing

You can also test the APIs manually using curl:

```bash
# Test the FastAPI backend directly
curl http://localhost:8000/api/stocks

# Test the Next.js API routes
curl http://localhost:3000/api/stocks
```

For POST requests:

```bash
# Run a simulation
curl -X POST "http://localhost:8000/api/simulation/run" \
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

## Troubleshooting

### Connection Refused
If you see "Connection refused" errors, make sure:
- The FastAPI server is running on port 8000
- The Next.js server is running on port 3000 (for web_api_test.py)
- No firewall is blocking the connections

### Invalid JSON Format
If you see JSON parsing errors, check that:
- Your curl commands have the correct syntax
- The JSON data is properly formatted
- You're using the correct Content-Type header for POST requests

### Next.js API Not Working
If the Next.js API routes aren't working:
- Verify the value of `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check that both servers are running
- Check the browser console for errors

## Expected Test Results

When running `test_api.py`, you should see output similar to:

```
===== Testing AI Hedge Fund API =====
Root endpoint: 200 {'message': 'AI Hedge Fund API is running'}
Health check: 200 {'status': 'healthy'}
All stocks: 200 Found 5 stocks
Stock AAPL: 200 Name: Apple Inc.
Stock AAPL history: 200 Data points: 30
Stock AAPL insights: 200 Insights: 4
Portfolio: 200 Holdings: 3, Total value: $13,643.40
Running simulation...
Simulation results: Trade decisions: 44, Analyst signals: 26, Portfolio history points: 129
Saved simulation with ID: 1
Retrieved simulation: Test Simulation
Deleted simulation with ID: 1
Created agent with ID: 1
Retrieved agent: Test Agent
Updated agent: Updated description
Retrieved all agents: 1
Deleted agent with ID: 1

✅ All tests completed!
``` 