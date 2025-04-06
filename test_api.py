#!/usr/bin/env python3
"""
Test script for the AI Hedge Fund API.
This script tests various endpoints to ensure they're working correctly.
"""

import requests
import json
from datetime import datetime, timedelta

# Base URL for API
BASE_URL = "http://localhost:8000"

def test_root():
    """Test the root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint:", response.status_code, response.json())

def test_health():
    """Test the health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health check:", response.status_code, response.json())

def test_stocks():
    """Test the stocks endpoints"""
    # Get all stocks
    response = requests.get(f"{BASE_URL}/api/stocks")
    print("All stocks:", response.status_code, f"Found {len(response.json())} stocks")
    
    # Get a specific stock
    symbol = "AAPL"
    response = requests.get(f"{BASE_URL}/api/stocks/{symbol}")
    print(f"Stock {symbol}:", response.status_code, f"Name: {response.json().get('name', 'N/A')}")
    
    # Get stock history
    response = requests.get(f"{BASE_URL}/api/stocks/{symbol}/history?timeframe=1M")
    print(f"Stock {symbol} history:", response.status_code, f"Data points: {len(response.json())}")
    
    # Get stock insights
    response = requests.get(f"{BASE_URL}/api/stocks/{symbol}/insights")
    print(f"Stock {symbol} insights:", response.status_code, f"Insights: {len(response.json())}")

def test_portfolio():
    """Test the portfolio endpoint"""
    response = requests.get(f"{BASE_URL}/api/portfolio")
    portfolio = response.json()
    print("Portfolio:", response.status_code, 
          f"Holdings: {len(portfolio.get('holdings', []))}, "
          f"Total value: ${portfolio.get('totalValue', 0):,.2f}")

def test_simulation():
    """Test the simulation endpoints"""
    # Run a simulation
    today = datetime.now()
    start_date = (today - timedelta(days=180)).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")
    
    simulation_config = {
        "ticker": "AAPL",
        "startDate": start_date,
        "endDate": end_date,
        "initialCash": 10000,
        "marginRequirement": 0,
        "model": "default",
        "showReasoning": True,
        "analyst": "warren_buffett"
    }
    
    print("Running simulation...")
    response = requests.post(
        f"{BASE_URL}/api/simulation/run", 
        json=simulation_config
    )
    
    if response.status_code == 200:
        results = response.json()
        print(f"Simulation results:", 
              f"Trade decisions: {len(results.get('tradeDecisions', []))}, "
              f"Analyst signals: {len(results.get('analystSignals', []))}, "
              f"Portfolio history points: {len(results.get('portfolioHistory', []))}")
        
        # Try saving the simulation
        save_data = {
            "name": "Test Simulation",
            "description": "A test simulation for AAPL",
            "config": simulation_config
        }
        
        response = requests.post(
            f"{BASE_URL}/api/simulations",
            json=save_data
        )
        
        if response.status_code == 200:
            saved_sim = response.json()
            sim_id = saved_sim.get("id")
            print(f"Saved simulation with ID: {sim_id}")
            
            # Get the saved simulation
            response = requests.get(f"{BASE_URL}/api/simulations/{sim_id}")
            if response.status_code == 200:
                print(f"Retrieved simulation: {response.json().get('name')}")
            
            # Delete the simulation
            response = requests.delete(f"{BASE_URL}/api/simulations/{sim_id}")
            if response.status_code == 200:
                print(f"Deleted simulation with ID: {sim_id}")
        else:
            print(f"Failed to save simulation: {response.status_code}")
    else:
        print(f"Simulation failed: {response.status_code}")
        print(response.text)

def test_agents():
    """Test the agents endpoints"""
    # Create a test agent
    agent_data = {
        "name": "Test Agent",
        "description": "A test trading agent",
        "strategy": "Value investing with momentum overlay",
        "risk_tolerance": "medium",
        "time_horizon": "long-term",
        "objectives": "Capital appreciation with moderate income"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/agents",
        json=agent_data
    )
    
    if response.status_code == 200:
        agent = response.json()
        agent_id = agent.get("id")
        print(f"Created agent with ID: {agent_id}")
        
        # Get the agent
        response = requests.get(f"{BASE_URL}/api/agents/{agent_id}")
        if response.status_code == 200:
            print(f"Retrieved agent: {response.json().get('name')}")
        
        # Update the agent
        agent_data["description"] = "Updated description"
        response = requests.put(
            f"{BASE_URL}/api/agents/{agent_id}",
            json=agent_data
        )
        
        if response.status_code == 200:
            print(f"Updated agent: {response.json().get('description')}")
        
        # Get all agents
        response = requests.get(f"{BASE_URL}/api/agents")
        if response.status_code == 200:
            print(f"Retrieved all agents: {len(response.json())}")
        
        # Delete the agent
        response = requests.delete(f"{BASE_URL}/api/agents/{agent_id}")
        if response.status_code == 200:
            print(f"Deleted agent with ID: {agent_id}")
    else:
        print(f"Failed to create agent: {response.status_code}")
        print(response.text)

def main():
    """Run all tests"""
    print("===== Testing AI Hedge Fund API =====")
    
    try:
        test_root()
        test_health()
        test_stocks()
        test_portfolio()
        test_simulation()
        test_agents()
        
        print("\n✅ All tests completed!")
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        print("Is the API server running? Start it with: poetry run start-api")

if __name__ == "__main__":
    main() 