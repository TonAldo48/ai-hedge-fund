from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional, Annotated
from pydantic import BaseModel, Field
from datetime import date, datetime, timedelta
import uvicorn
import os
import json
from pathlib import Path

# Import hedge fund components
# We'll update these imports as we refactor the codebase
from models import load_model
from analyst import get_analyst_by_name

# Create FastAPI app
app = FastAPI(
    title="AI Hedge Fund API",
    description="API for running AI Hedge Fund simulations",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:8000",  # FastAPI server (for potential use in development)
]

# Add additional origins from environment variable if set
if os.environ.get("ALLOWED_ORIGINS"):
    additional_origins = os.environ.get("ALLOWED_ORIGINS").split(",")
    origins.extend(additional_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class SimulationConfig(BaseModel):
    ticker: str
    startDate: str
    endDate: str
    initialCash: float
    marginRequirement: float = 0.0
    model: str
    showReasoning: bool = False
    analyst: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "ticker": "AAPL",
                    "startDate": "2023-01-01",
                    "endDate": "2023-06-30",
                    "initialCash": 10000,
                    "marginRequirement": 0,
                    "model": "default",
                    "showReasoning": True,
                    "analyst": "warren_buffett"
                }
            ]
        }
    }

class SaveSimulationRequest(BaseModel):
    name: str
    description: str
    config: SimulationConfig
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Apple H1 2023",
                    "description": "Simulation of AAPL for first half of 2023",
                    "config": {
                        "ticker": "AAPL",
                        "startDate": "2023-01-01",
                        "endDate": "2023-06-30",
                        "initialCash": 10000,
                        "marginRequirement": 0,
                        "model": "default",
                        "showReasoning": True,
                        "analyst": "warren_buffett"
                    }
                }
            ]
        }
    }

class CustomAgentRequest(BaseModel):
    name: str
    description: str
    strategy: str
    risk_tolerance: str
    time_horizon: str
    objectives: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "My Custom Agent",
                    "description": "A conservative value investor",
                    "strategy": "Value investing with focus on dividends",
                    "risk_tolerance": "low",
                    "time_horizon": "long-term",
                    "objectives": "Income generation with capital preservation"
                }
            ]
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI Hedge Fund API is running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Routes will be implemented below

# Helper to create data directory if it doesn't exist
def ensure_data_dir():
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    return data_dir

# Main function to run the API server
def start_api(host="0.0.0.0", port=8000):
    """Start the FastAPI server"""
    # Create data directory if it doesn't exist
    ensure_data_dir()
    
    # Start the server with the updated configuration
    uvicorn.run(
        "api:app", 
        host=host, 
        port=port, 
        reload=True,
        log_level="info",
        access_log=True
    )

# Simulation endpoints
@app.post("/api/simulation/run", response_model=Dict[str, Any])
async def run_simulation(config: SimulationConfig):
    """Run a hedge fund simulation with the given configuration"""
    try:
        # Convert the config to the format expected by the simulation engine
        ticker = config.ticker
        start_date = config.startDate
        end_date = config.endDate
        initial_cash = config.initialCash
        margin_requirement = config.marginRequirement
        model_name = config.model
        show_reasoning = config.showReasoning
        analyst_name = config.analyst
        
        # Here we would call the refactored simulation engine
        # For now, we'll return a mock response
        
        # Convert dates to Python dates
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        # Generate mock data for testing
        trade_decisions = generate_mock_trade_decisions(ticker, start, end)
        analyst_signals = generate_mock_analyst_signals(ticker, start, end, analyst_name)
        portfolio_history = generate_mock_portfolio_history(start, end, initial_cash)
        performance = calculate_mock_performance(portfolio_history, initial_cash)
        
        return {
            "tradeDecisions": trade_decisions,
            "analystSignals": analyst_signals,
            "portfolioHistory": portfolio_history,
            "performance": performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions for mock data
def generate_mock_trade_decisions(ticker, start_date, end_date):
    """Generate mock trade decisions for testing"""
    # Split ticker by comma if multiple tickers
    tickers = ticker.split(',')
    
    # Calculate date range
    date_range = (end_date - start_date).days
    current_date = start_date
    
    decisions = []
    for i in range(0, date_range, 3):  # Make a decision every 3 days
        current_date = start_date + timedelta(days=i)
        
        # Skip weekends
        if current_date.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
            continue
            
        for tick in tickers:
            # Random price between $50 and $500
            price = 50 + (450 * i / date_range)
            
            # Randomly decide action
            action = "BUY" if i % 5 < 3 else "SELL"
            shares = int(1000 / price) if action == "BUY" else int(500 / price)
            
            if shares > 0:
                decisions.append({
                    "date": current_date.isoformat(),
                    "ticker": tick,
                    "action": action,
                    "shares": shares,
                    "price": round(price, 2),
                    "total": round(shares * price, 2),
                    "reasoning": f"Mock {action.lower()} decision for testing"
                })
    
    return decisions

def generate_mock_analyst_signals(ticker, start_date, end_date, analyst_name):
    """Generate mock analyst signals for testing"""
    # Split ticker by comma if multiple tickers
    tickers = ticker.split(',')
    
    # Split analyst name by comma if multiple analysts
    analysts = ["warren_buffett", "technical_analyst", "fundamentals_analyst"]
    if analyst_name != "all":
        analysts = analyst_name.split(',')
    
    # Calculate date range
    date_range = (end_date - start_date).days
    current_date = start_date
    
    signals = []
    for i in range(0, date_range, 7):  # Make a signal every 7 days
        current_date = start_date + timedelta(days=i)
        
        # Skip weekends
        if current_date.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
            continue
            
        for tick in tickers:
            # Randomly select an analyst
            analyst = analysts[i % len(analysts)]
            
            # Randomly decide signal
            signal_types = ["BULLISH", "BEARISH", "NEUTRAL"]
            signal = signal_types[i % 3]
            
            signals.append({
                "date": current_date.isoformat(),
                "ticker": tick,
                "analyst": analyst,
                "signal": signal,
                "confidence": round(0.5 + (i / date_range) * 0.5, 2),
                "reasoning": f"Mock {signal.lower()} signal from {analyst} for testing"
            })
    
    return signals

def generate_mock_portfolio_history(start_date, end_date, initial_cash):
    """Generate mock portfolio history for testing"""
    # Calculate date range
    date_range = (end_date - start_date).days
    current_date = start_date
    
    history = []
    current_value = initial_cash
    
    for i in range(date_range):
        current_date = start_date + timedelta(days=i)
        
        # Skip weekends
        if current_date.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
            continue
            
        # Add random change to portfolio value
        change_percent = (0.02 * (i / date_range)) - 0.01  # Range from -1% to +1%
        current_value = current_value * (1 + change_percent)
        
        history.append({
            "date": current_date.isoformat(),
            "value": round(current_value, 2)
        })
    
    return history

def calculate_mock_performance(portfolio_history, initial_cash):
    """Calculate mock performance metrics"""
    if not portfolio_history:
        return {
            "totalReturn": 0,
            "annualizedReturn": 0,
            "maxDrawdown": 0,
            "sharpeRatio": 0,
            "winRate": 0,
            "profitFactor": 0,
            "avgWin": 0,
            "avgLoss": 0
        }
    
    # Get initial and final values
    initial_value = initial_cash
    final_value = portfolio_history[-1]["value"]
    
    # Calculate total return
    total_return = ((final_value - initial_value) / initial_value) * 100
    
    # Calculate date range for annualized return
    first_date = datetime.strptime(portfolio_history[0]["date"], "%Y-%m-%d").date()
    last_date = datetime.strptime(portfolio_history[-1]["date"], "%Y-%m-%d").date()
    years = (last_date - first_date).days / 365
    years = max(years, 0.01)  # Avoid division by zero
    
    # Calculate annualized return
    annualized_return = (((final_value / initial_value) ** (1 / years)) - 1) * 100
    
    # Calculate max drawdown
    peak_value = initial_value
    max_drawdown = 0
    
    for point in portfolio_history:
        value = point["value"]
        if value > peak_value:
            peak_value = value
        else:
            drawdown = ((peak_value - value) / peak_value) * 100
            max_drawdown = max(max_drawdown, drawdown)
    
    # Mock other metrics
    return {
        "totalReturn": round(total_return, 2),
        "annualizedReturn": round(annualized_return, 2),
        "maxDrawdown": round(max_drawdown, 2),
        "sharpeRatio": round(annualized_return / (max_drawdown + 1), 2),
        "winRate": round(60 + (total_return / 10), 2),
        "profitFactor": round(1.5 + (total_return / 100), 2),
        "avgWin": round(initial_value * 0.05, 2),
        "avgLoss": round(initial_value * 0.03, 2)
    }

# Saved simulations endpoints
@app.get("/api/simulations")
async def get_simulations():
    """Get all saved simulations"""
    try:
        data_dir = ensure_data_dir()
        simulations_file = data_dir / "simulations.json"
        
        if not simulations_file.exists():
            return []
        
        with open(simulations_file, "r") as f:
            simulations = json.load(f)
        
        return simulations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulations")
async def save_simulation(simulation: SaveSimulationRequest):
    """Save a simulation"""
    try:
        data_dir = ensure_data_dir()
        simulations_file = data_dir / "simulations.json"
        
        # Load existing simulations
        simulations = []
        if simulations_file.exists():
            with open(simulations_file, "r") as f:
                simulations = json.load(f)
        
        # Generate a new ID
        new_id = str(len(simulations) + 1)
        
        # Create a new simulation record
        new_simulation = {
            "id": new_id,
            "name": simulation.name,
            "description": simulation.description,
            "ticker": simulation.config.ticker,
            "date_created": datetime.now().isoformat(),
            "config": simulation.config.dict()
        }
        
        # Add to list and save
        simulations.append(new_simulation)
        with open(simulations_file, "w") as f:
            json.dump(simulations, f, indent=2)
        
        return new_simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulations/{simulation_id}")
async def get_simulation(simulation_id: str):
    """Get a specific simulation by ID"""
    try:
        data_dir = ensure_data_dir()
        simulations_file = data_dir / "simulations.json"
        
        if not simulations_file.exists():
            raise HTTPException(status_code=404, detail="No simulations found")
        
        with open(simulations_file, "r") as f:
            simulations = json.load(f)
        
        # Find the simulation by ID
        simulation = next((s for s in simulations if s["id"] == simulation_id), None)
        
        if not simulation:
            raise HTTPException(status_code=404, detail=f"Simulation with ID {simulation_id} not found")
        
        return simulation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/simulations/{simulation_id}")
async def update_simulation(simulation_id: str, simulation: SaveSimulationRequest):
    """Update a simulation by ID"""
    try:
        data_dir = ensure_data_dir()
        simulations_file = data_dir / "simulations.json"
        
        if not simulations_file.exists():
            raise HTTPException(status_code=404, detail="No simulations found")
        
        with open(simulations_file, "r") as f:
            simulations = json.load(f)
        
        # Find the simulation by ID
        simulation_index = next((i for i, s in enumerate(simulations) if s["id"] == simulation_id), None)
        
        if simulation_index is None:
            raise HTTPException(status_code=404, detail=f"Simulation with ID {simulation_id} not found")
        
        # Update the simulation
        simulations[simulation_index].update({
            "name": simulation.name,
            "description": simulation.description,
            "ticker": simulation.config.ticker,
            "config": simulation.config.dict()
        })
        
        # Save the updated list
        with open(simulations_file, "w") as f:
            json.dump(simulations, f, indent=2)
        
        return simulations[simulation_index]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/simulations/{simulation_id}")
async def delete_simulation(simulation_id: str):
    """Delete a simulation by ID"""
    try:
        data_dir = ensure_data_dir()
        simulations_file = data_dir / "simulations.json"
        
        if not simulations_file.exists():
            raise HTTPException(status_code=404, detail="No simulations found")
        
        with open(simulations_file, "r") as f:
            simulations = json.load(f)
        
        # Filter out the simulation with the given ID
        filtered_simulations = [s for s in simulations if s["id"] != simulation_id]
        
        if len(filtered_simulations) == len(simulations):
            raise HTTPException(status_code=404, detail=f"Simulation with ID {simulation_id} not found")
        
        # Save the updated list
        with open(simulations_file, "w") as f:
            json.dump(filtered_simulations, f, indent=2)
        
        return {"message": f"Simulation with ID {simulation_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stock endpoints
@app.get("/api/stocks")
async def get_stocks():
    """Get a list of available stocks"""
    try:
        # In a real implementation, we would fetch this from a database or external API
        # For now, we'll return mock data
        stocks = [
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "price": 173.45,
                "change": 2.35,
                "changePercent": 1.37,
                "marketCap": 2850000000000,
                "volume": 62500000,
                "sector": "Technology"
            },
            {
                "symbol": "MSFT",
                "name": "Microsoft Corporation",
                "price": 328.79,
                "change": 1.05,
                "changePercent": 0.32,
                "marketCap": 2450000000000,
                "volume": 21800000,
                "sector": "Technology"
            },
            {
                "symbol": "GOOGL",
                "name": "Alphabet Inc.",
                "price": 135.31,
                "change": -0.61,
                "changePercent": -0.45,
                "marketCap": 1720000000000,
                "volume": 23700000,
                "sector": "Technology"
            },
            {
                "symbol": "AMZN",
                "name": "Amazon.com, Inc.",
                "price": 129.12,
                "change": 1.43,
                "changePercent": 1.12,
                "marketCap": 1320000000000,
                "volume": 35600000,
                "sector": "Consumer Cyclical"
            },
            {
                "symbol": "TSLA",
                "name": "Tesla, Inc.",
                "price": 248.5,
                "change": -5.3,
                "changePercent": -2.09,
                "marketCap": 780000000000,
                "volume": 118000000,
                "sector": "Automotive"
            }
        ]
        
        return stocks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{symbol}")
async def get_stock_details(symbol: str):
    """Get detailed information about a specific stock"""
    try:
        # In a real implementation, we would fetch this from a database or external API
        # For now, we'll return mock data based on the symbol
        stocks = {
            "AAPL": {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "price": 173.45,
                "change": 2.35,
                "changePercent": 1.37,
                "marketCap": 2850000000000,
                "volume": 62500000,
                "sector": "Technology",
                "high52": 180.45,
                "low52": 124.17,
                "pe": 28.7,
                "dividend": 0.92,
                "yield": 0.53,
                "beta": 1.28,
                "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories."
            },
            "MSFT": {
                "symbol": "MSFT",
                "name": "Microsoft Corporation",
                "price": 328.79,
                "change": 1.05,
                "changePercent": 0.32,
                "marketCap": 2450000000000,
                "volume": 21800000,
                "sector": "Technology",
                "high52": 335.94,
                "low52": 213.43,
                "pe": 35.2,
                "dividend": 2.48,
                "yield": 0.75,
                "beta": 0.93,
                "description": "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing."
            },
            "GOOGL": {
                "symbol": "GOOGL",
                "name": "Alphabet Inc.",
                "price": 135.31,
                "change": -0.61,
                "changePercent": -0.45,
                "marketCap": 1720000000000,
                "volume": 23700000,
                "sector": "Technology",
                "high52": 143.71,
                "low52": 83.34,
                "pe": 26.1,
                "dividend": 0,
                "yield": 0,
                "beta": 1.06,
                "description": "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments."
            }
        }
        
        # If the requested symbol is in our mock data, return it
        if symbol in stocks:
            return stocks[symbol]
        
        # Otherwise, generate a generic mock response
        return {
            "symbol": symbol,
            "name": f"{symbol} Corporation",
            "price": round(100 + (symbol.encode()[0] / 255) * 400, 2),
            "change": round((symbol.encode()[0] % 10) - 5, 2),
            "changePercent": round(((symbol.encode()[0] % 10) - 5) / 100, 2),
            "marketCap": int(1000000000 + (symbol.encode()[0] * 10000000000)),
            "volume": int(1000000 + (symbol.encode()[0] * 100000)),
            "sector": "Technology",
            "high52": round(120 + (symbol.encode()[0] / 255) * 400, 2),
            "low52": round(80 + (symbol.encode()[0] / 255) * 100, 2),
            "pe": round(10 + (symbol.encode()[0] / 255) * 30, 2),
            "dividend": round((symbol.encode()[0] % 5) / 10, 2),
            "yield": round((symbol.encode()[0] % 5) / 100, 2),
            "beta": round(0.8 + (symbol.encode()[0] / 255), 2),
            "description": f"{symbol} Corporation is a leading company in the technology sector, focusing on innovation and sustainable growth."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{symbol}/history")
async def get_stock_history(
    symbol: str, 
    timeframe: str = Query("3M", description="Timeframe for history (1D, 1W, 1M, 3M, 1Y, 5Y)")
):
    """Get historical price data for a stock"""
    try:
        # Validate timeframe
        valid_timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"]
        if timeframe not in valid_timeframes:
            raise HTTPException(status_code=400, detail=f"Invalid timeframe. Use one of: {', '.join(valid_timeframes)}")
        
        # Calculate date range based on timeframe
        end_date = date.today()
        
        if timeframe == "1D":
            start_date = end_date - timedelta(days=1)
            interval = timedelta(hours=1)
            data_points = 24
        elif timeframe == "1W":
            start_date = end_date - timedelta(weeks=1)
            interval = timedelta(days=1)
            data_points = 7
        elif timeframe == "1M":
            start_date = end_date - timedelta(days=30)
            interval = timedelta(days=1)
            data_points = 30
        elif timeframe == "3M":
            start_date = end_date - timedelta(days=90)
            interval = timedelta(days=1)
            data_points = 90
        elif timeframe == "1Y":
            start_date = end_date - timedelta(days=365)
            interval = timedelta(days=7)
            data_points = 52
        else:  # 5Y
            start_date = end_date - timedelta(days=365 * 5)
            interval = timedelta(days=30)
            data_points = 60
        
        # Generate mock price history based on symbol and timeframe
        # We'll use a deterministic algorithm based on the symbol
        seed = sum(symbol.encode())
        history = []
        
        # Set base price based on symbol
        base_price = 100 + (seed % 400)
        
        # Create slightly different price patterns based on the first character of the symbol
        volatility = (ord(symbol[0]) % 10) / 100  # 0% to 9%
        trend = ((ord(symbol[0]) % 10) - 5) / 500  # -0.5% to +0.5% per day
        
        current_date = start_date
        current_price = base_price
        
        for i in range(data_points):
            # Skip weekends for 1D, 1W, 1M, 3M timeframes
            if timeframe in ["1D", "1W", "1M", "3M"]:
                while current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                    current_date += timedelta(days=1)
            
            # Calculate price change
            # Add some randomness but keep it deterministic based on the date and symbol
            day_seed = (current_date.day * current_date.month + ord(symbol[0])) % 100
            random_change = ((day_seed / 100) * 2 - 1) * volatility
            
            # Apply trend and random change
            current_price *= (1 + trend + random_change)
            
            # Ensure price is positive
            current_price = max(1, current_price)
            
            # Add to history
            history.append({
                "date": current_date.isoformat(),
                "price": round(current_price, 2)
            })
            
            # Advance date
            current_date += interval
        
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{symbol}/insights")
async def get_stock_insights(symbol: str):
    """Get analyst insights for a specific stock"""
    try:
        # Mock analyst insights based on the symbol
        today = date.today()
        
        # Create a set of mock analysts with different perspectives
        analysts = [
            {
                "name": "AI Warren Buffett",
                "style": "value",
                "timeframe": "long-term"
            },
            {
                "name": "AI Technical Analyst",
                "style": "technical",
                "timeframe": "short-term"
            },
            {
                "name": "AI Cathie Wood",
                "style": "growth",
                "timeframe": "long-term"
            },
            {
                "name": "AI Fundamentals Analyst",
                "style": "fundamentals",
                "timeframe": "medium-term"
            }
        ]
        
        # Generate insights
        insights = []
        
        for i, analyst in enumerate(analysts):
            # Generate a rating based on the analyst's style and the symbol
            seed = (sum(symbol.encode()) + i) % 100
            
            if analyst["style"] == "value":
                # Value investors tend to be more conservative
                rating = "BUY" if seed > 60 else ("HOLD" if seed > 30 else "SELL")
            elif analyst["style"] == "growth":
                # Growth investors tend to be more optimistic
                rating = "BUY" if seed > 40 else ("HOLD" if seed > 10 else "SELL")
            else:
                # Others are more balanced
                rating = "BUY" if seed > 50 else ("HOLD" if seed > 30 else "SELL")
            
            # Generate a target price for BUY ratings
            current_price = 100 + (sum(symbol.encode()) % 400)
            target_price = None
            
            if rating == "BUY":
                # Target price is 10-30% higher than current price
                target_price = round(current_price * (1.1 + (seed % 20) / 100), 2)
            
            # Generate a summary based on the rating and analyst style
            summary = ""
            
            if analyst["style"] == "value":
                if rating == "BUY":
                    summary = f"{symbol} represents excellent value at current prices. Strong balance sheet and cash flow generation with a durable competitive advantage."
                elif rating == "HOLD":
                    summary = f"{symbol} is currently trading near fair value. The company has solid fundamentals but limited margin of safety at current prices."
                else:
                    summary = f"{symbol} appears overvalued at current prices. Concerns about increasing competition and declining margins."
            elif analyst["style"] == "growth":
                if rating == "BUY":
                    summary = f"{symbol} is positioned for exponential growth in its sector. Their R&D investments and innovative approach will drive significant revenue expansion."
                elif rating == "HOLD":
                    summary = f"{symbol} has decent growth prospects but faces increasing competition. Wait for a better entry point or more clarity on new product adoption."
                else:
                    summary = f"{symbol} is facing significant headwinds in its growth trajectory. Recent product launches have underperformed expectations."
            elif analyst["style"] == "technical":
                if rating == "BUY":
                    summary = f"{symbol} has broken through key resistance levels with increasing volume. Technical indicators suggest continued upward momentum."
                elif rating == "HOLD":
                    summary = f"{symbol} is in a consolidation phase. Wait for confirmation of the next trend direction before taking a position."
                else:
                    summary = f"{symbol} has broken below key support levels with bearish indicators. Moving averages suggest continued downward pressure."
            else:  # fundamentals
                if rating == "BUY":
                    summary = f"{symbol} reported strong earnings with positive guidance. Key metrics including ROE and profit margins are trending positively."
                elif rating == "HOLD":
                    summary = f"{symbol} shows mixed fundamental signals. While revenue is growing, margin compression is a concern for future profitability."
                else:
                    summary = f"{symbol} has deteriorating fundamentals with concerning trends in key performance indicators. Recent quarterly results missed expectations."
            
            # Add insight to the list
            insight_date = today - timedelta(days=i)
            
            insights.append({
                "analyst": analyst["name"],
                "ticker": symbol,
                "rating": rating,
                "targetPrice": target_price,
                "summary": summary,
                "date": insight_date.isoformat()
            })
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Portfolio endpoints
@app.get("/api/portfolio")
async def get_portfolio():
    """Get current portfolio data"""
    try:
        # In a real implementation, we would fetch this from a database
        # For now, we'll return mock data
        
        # Generate mock holdings
        holdings = [
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "shares": 25,
                "averageCost": 155.35,
                "currentPrice": 173.45,
                "value": 4336.25,
                "dayChange": 2.35 * 25,
                "totalGain": (173.45 - 155.35) * 25,
                "totalGainPercent": ((173.45 - 155.35) / 155.35) * 100
            },
            {
                "symbol": "MSFT",
                "name": "Microsoft Corporation",
                "shares": 15,
                "averageCost": 290.12,
                "currentPrice": 328.79,
                "value": 4931.85,
                "dayChange": 1.05 * 15,
                "totalGain": (328.79 - 290.12) * 15,
                "totalGainPercent": ((328.79 - 290.12) / 290.12) * 100
            },
            {
                "symbol": "NVDA",
                "name": "NVIDIA Corporation",
                "shares": 10,
                "averageCost": 350.25,
                "currentPrice": 437.53,
                "value": 4375.3,
                "dayChange": 12.33 * 10,
                "totalGain": (437.53 - 350.25) * 10,
                "totalGainPercent": ((437.53 - 350.25) / 350.25) * 100
            }
        ]
        
        # Generate mock transactions
        transactions = [
            {
                "id": "1",
                "date": "2023-04-01",
                "symbol": "AAPL",
                "action": "BUY",
                "shares": 15,
                "price": 165.21,
                "total": 15 * 165.21,
                "agent": "Warren Buffett"
            },
            {
                "id": "2",
                "date": "2023-04-05",
                "symbol": "AAPL",
                "action": "BUY",
                "shares": 10,
                "price": 145.50,
                "total": 10 * 145.50,
                "agent": "Technical Analyst"
            },
            {
                "id": "3",
                "date": "2023-04-10",
                "symbol": "MSFT",
                "action": "BUY",
                "shares": 15,
                "price": 290.12,
                "total": 15 * 290.12,
                "agent": "Warren Buffett"
            },
            {
                "id": "4",
                "date": "2023-04-15",
                "symbol": "NVDA",
                "action": "BUY",
                "shares": 10,
                "price": 350.25,
                "total": 10 * 350.25,
                "agent": "Cathie Wood"
            }
        ]
        
        # Calculate total value and gain
        total_value = sum(holding["value"] for holding in holdings)
        total_cost = sum(holding["averageCost"] * holding["shares"] for holding in holdings)
        total_gain = total_value - total_cost
        
        # Generate portfolio history (90 days)
        portfolio_history = []
        today = date.today()
        
        # Start with current value and work backwards
        history_value = total_value
        
        for i in range(90):
            # Skip weekends
            history_date = today - timedelta(days=i)
            if history_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                continue
            
            # Add some randomness to the value changes, with a slight upward trend
            daily_change = (0.01 - (0.005 * (i / 90))) * history_value
            history_value -= daily_change
            
            # Ensure value is positive
            history_value = max(1000, history_value)
            
            portfolio_history.append({
                "date": history_date.isoformat(),
                "value": round(history_value, 2)
            })
        
        # Sort history from oldest to newest
        portfolio_history.reverse()
        
        return {
            "totalValue": total_value,
            "cashBalance": 15000,
            "totalGain": total_gain,
            "totalGainPercent": (total_gain / total_cost) * 100,
            "buyingPower": 15000,
            "holdings": holdings,
            "transactions": transactions,
            "portfolioHistory": portfolio_history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Agent endpoints
@app.get("/api/agents")
async def get_agents():
    """Get all custom agents"""
    try:
        data_dir = ensure_data_dir()
        agents_file = data_dir / "agents.json"
        
        if not agents_file.exists():
            return []
        
        with open(agents_file, "r") as f:
            agents = json.load(f)
        
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents")
async def create_agent(agent: CustomAgentRequest):
    """Create a new custom agent"""
    try:
        data_dir = ensure_data_dir()
        agents_file = data_dir / "agents.json"
        
        # Load existing agents
        agents = []
        if agents_file.exists():
            with open(agents_file, "r") as f:
                agents = json.load(f)
        
        # Generate a new ID
        new_id = str(len(agents) + 1)
        
        # Create a new agent record
        new_agent = {
            "id": new_id,
            "name": agent.name,
            "description": agent.description,
            "strategy": agent.strategy,
            "risk_tolerance": agent.risk_tolerance,
            "time_horizon": agent.time_horizon,
            "objectives": agent.objectives,
            "date_created": datetime.now().isoformat()
        }
        
        # Add to list and save
        agents.append(new_agent)
        with open(agents_file, "w") as f:
            json.dump(agents, f, indent=2)
        
        return new_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    try:
        data_dir = ensure_data_dir()
        agents_file = data_dir / "agents.json"
        
        if not agents_file.exists():
            raise HTTPException(status_code=404, detail="No agents found")
        
        with open(agents_file, "r") as f:
            agents = json.load(f)
        
        # Find the agent by ID
        agent = next((a for a in agents if a["id"] == agent_id), None)
        
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
        
        return agent
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, agent: CustomAgentRequest):
    """Update an agent by ID"""
    try:
        data_dir = ensure_data_dir()
        agents_file = data_dir / "agents.json"
        
        if not agents_file.exists():
            raise HTTPException(status_code=404, detail="No agents found")
        
        with open(agents_file, "r") as f:
            agents = json.load(f)
        
        # Find the agent by ID
        agent_index = next((i for i, a in enumerate(agents) if a["id"] == agent_id), None)
        
        if agent_index is None:
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
        
        # Update the agent
        agents[agent_index].update({
            "name": agent.name,
            "description": agent.description,
            "strategy": agent.strategy,
            "risk_tolerance": agent.risk_tolerance,
            "time_horizon": agent.time_horizon,
            "objectives": agent.objectives,
            "date_updated": datetime.now().isoformat()
        })
        
        # Save the updated list
        with open(agents_file, "w") as f:
            json.dump(agents, f, indent=2)
        
        return agents[agent_index]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent by ID"""
    try:
        data_dir = ensure_data_dir()
        agents_file = data_dir / "agents.json"
        
        if not agents_file.exists():
            raise HTTPException(status_code=404, detail="No agents found")
        
        with open(agents_file, "r") as f:
            agents = json.load(f)
        
        # Filter out the agent with the given ID
        filtered_agents = [a for a in agents if a["id"] != agent_id]
        
        if len(filtered_agents) == len(agents):
            raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found")
        
        # Save the updated list
        with open(agents_file, "w") as f:
            json.dump(filtered_agents, f, indent=2)
        
        return {"message": f"Agent with ID {agent_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    start_api() 