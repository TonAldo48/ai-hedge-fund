#!/usr/bin/env python3
"""
Start the AI Hedge Fund API server.
This script sets up and runs the FastAPI server for the AI Hedge Fund application.
"""

import os
import argparse
from api import start_api

def main():
    """Parse command line arguments and start the API server"""
    parser = argparse.ArgumentParser(description="Start the AI Hedge Fund API server")
    
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host IP to bind to (default: 0.0.0.0)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind to (default: 8000)"
    )
    
    parser.add_argument(
        "--allowed-origins",
        type=str,
        help="Comma-separated list of additional allowed origins for CORS"
    )
    
    args = parser.parse_args()
    
    # Set environment variables from arguments if provided
    if args.allowed_origins:
        os.environ["ALLOWED_ORIGINS"] = args.allowed_origins
    
    # Start the API server
    print(f"Starting AI Hedge Fund API server on {args.host}:{args.port}")
    start_api(host=args.host, port=args.port)

if __name__ == "__main__":
    main() 