# API Integration

This document describes the API integration between the Next.js frontend and Python backend.

## Configuration

API integration uses environment variables to control behavior:

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of the Python backend API (default: `http://localhost:8000`)
- `NEXT_PUBLIC_USE_MOCK_DATA`: Set to `true` to use mock data when API calls fail (useful for development)

## API Routes

The frontend uses Next.js API routes to proxy requests to the Python backend:

### Simulation

- `GET /api/simulations`: Get all saved simulations
- `POST /api/simulations`: Save a new simulation
- `GET /api/simulations/[id]`: Get a specific simulation
- `PUT /api/simulations/[id]`: Update a simulation
- `DELETE /api/simulations/[id]`: Delete a simulation
- `POST /api/simulation`: Run a simulation

### Portfolio

- `GET /api/portfolio`: Get portfolio data

### Stocks

- `GET /api/stocks`: Get all stocks
- `GET /api/stocks/[symbol]`: Get details for a specific stock
- `GET /api/stocks/[symbol]/history`: Get price history for a stock
- `GET /api/stocks/[symbol]/insights`: Get analyst insights for a stock

### Agents

- `GET /api/agents`: Get all agents
- `POST /api/agents`: Create a new agent
- `GET /api/agents/[id]`: Get a specific agent
- `PUT /api/agents/[id]`: Update an agent
- `DELETE /api/agents/[id]`: Delete an agent

## Development Mode

During development, the application can function without a connected backend by using mock data. To enable this functionality:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
2. Mock data functions are defined in `src/lib/api.ts`

## Production Mode

In production:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` or environment variables
2. Set `NEXT_PUBLIC_API_BASE_URL` to the URL of your backend API
3. Ensure the backend API implements all required endpoints

## Expected Response Formats

### Simulation Config

```typescript
interface SimulationConfig {
  ticker: string;
  startDate: string;
  endDate: string;
  initialCash: number;
  marginRequirement: number;
  model: string;
  showReasoning: boolean;
  analyst: AnalystType;
}
```

### Simulation Result

```typescript
interface SimulationResult {
  tradeDecisions: TradeDecision[];
  analystSignals: AnalystSignal[];
  portfolioHistory: PortfolioPoint[];
  performance: PerformanceMetrics;
}
```

### Portfolio Data

```typescript
interface PortfolioData {
  totalValue: number;
  cashBalance: number;
  totalGain: number;
  totalGainPercent: number;
  buyingPower: number;
  holdings: PortfolioHolding[];
  transactions: Transaction[];
  portfolioHistory: PortfolioPoint[];
}
```

## Error Handling

All API routes include error handling:

1. API failures return appropriate HTTP status codes
2. Error details are logged to the console
3. In development, mock data can be returned instead of errors
4. Components display user-friendly error messages 