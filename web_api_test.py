#!/usr/bin/env python3
"""
Test script for the Next.js API routes.
This script tests if the frontend API routes correctly proxy requests to the backend.
Note: This assumes the Next.js server is running on port 3000.
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Base URL for API
NEXTJS_URL = "http://localhost:3000"

def test_stocks_api():
    """Test the stocks API route"""
    try:
        response = requests.get(f"{NEXTJS_URL}/api/stocks")
        if response.status_code == 200:
            stocks = response.json()
            print(f"✅ Stocks API: Retrieved {len(stocks)} stocks")
            return True
        else:
            print(f"❌ Stocks API: Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stocks API: Error: {str(e)}")
        return False

def test_portfolio_api():
    """Test the portfolio API route"""
    try:
        response = requests.get(f"{NEXTJS_URL}/api/portfolio")
        if response.status_code == 200:
            portfolio = response.json()
            print(f"✅ Portfolio API: Retrieved portfolio with {len(portfolio.get('holdings', []))} holdings")
            return True
        else:
            print(f"❌ Portfolio API: Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Portfolio API: Error: {str(e)}")
        return False

def test_simulation_api():
    """Test the simulation API route"""
    try:
        # Prepare simulation config
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
        
        response = requests.post(
            f"{NEXTJS_URL}/api/simulation",
            json=simulation_config
        )
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Simulation API: Run simulation with {len(results.get('tradeDecisions', []))} trade decisions")
            return True
        else:
            print(f"❌ Simulation API: Failed with status {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Simulation API: Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("===== Testing Next.js API Routes =====")
    
    # Count successful tests
    success_count = 0
    test_count = 3
    
    if test_stocks_api():
        success_count += 1
        
    if test_portfolio_api():
        success_count += 1
    
    if test_simulation_api():
        success_count += 1
    
    # Print summary
    print(f"\nTest Summary: {success_count}/{test_count} tests passed")
    
    if success_count == test_count:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed")
        print("Note: Make sure both the FastAPI backend (port 8000) and Next.js frontend (port 3000) are running")
        sys.exit(1)

if __name__ == "__main__":
    main() 