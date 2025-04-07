import { NextResponse } from 'next/server'
import { getQuote, isRapidAPIConfigured } from '@/lib/yahoo-finance'

// Configuration for the Python backend
// Use explicit IPv4 address to avoid IPv6 resolution issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
// Flag to enable direct Yahoo Finance data fetching
const USE_YAHOO_FINANCE = process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE === 'true'

// Common stock symbols to display in Market Overview if no specific list is provided
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT']

// Fallback mock data to display when both Yahoo Finance and Python backend fail
const FALLBACK_MOCK_DATA = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.72,
    change: 2.45,
    changePercent: 1.39,
    marketCap: 2800000000000,
    volume: 57000000,
    sector: 'Technology'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 402.65,
    change: 3.18,
    changePercent: 0.79,
    marketCap: 3000000000000,
    volume: 21000000,
    sector: 'Technology'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.17,
    change: -0.83,
    changePercent: -0.58,
    marketCap: 1800000000000,
    volume: 25000000,
    sector: 'Technology'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.15,
    change: 1.23,
    changePercent: 0.70,
    marketCap: 1850000000000,
    volume: 30000000,
    sector: 'Consumer Cyclical'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 255.70,
    change: -3.45,
    changePercent: -1.33,
    marketCap: 810000000000,
    volume: 92000000,
    sector: 'Automotive'
  }
]

export async function GET() {
  console.log('=============================================');
  console.log(`Fetching stocks for Market Overview`);
  console.log(`Environment variables:`);
  console.log(`NEXT_PUBLIC_USE_YAHOO_FINANCE=${process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE}`);
  console.log(`RAPIDAPI_KEY configured: ${isRapidAPIConfigured()}`);
  console.log(`USE_YAHOO_FINANCE flag=${USE_YAHOO_FINANCE}`);
  console.log('=============================================');
  
  // If Yahoo Finance is enabled but RapidAPI key is not configured, inform the user
  if (USE_YAHOO_FINANCE && !isRapidAPIConfigured()) {
    console.warn('Yahoo Finance is enabled but RapidAPI key is not configured.');
    console.warn('Please sign up at https://rapidapi.com/apidojo/api/yahoo-finance1/ and add your API key to .env.local');
    console.log('Returning fallback mock data instead');
    return NextResponse.json(FALLBACK_MOCK_DATA);
  }
  
  try {
    // First try Yahoo Finance direct fetch if enabled
    if (USE_YAHOO_FINANCE && isRapidAPIConfigured()) {
      try {
        console.log('Fetching stock data from Yahoo Finance API');
        
        // Fetch quotes for all default symbols in parallel
        const quotePromises = DEFAULT_SYMBOLS.map(symbol => getQuote(symbol));
        const quotes = await Promise.all(quotePromises);
        
        // Filter out any null results and format the data
        const stocksData = quotes
          .filter(quote => quote !== null)
          .map(quote => {
            return {
              symbol: quote.symbol,
              name: quote.longName || quote.shortName || quote.symbol,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              marketCap: quote.marketCap,
              volume: quote.regularMarketVolume,
              sector: getSectorFromExchange(quote.exchange),
            };
          });
        
        if (stocksData && stocksData.length > 0) {
          console.log(`Successfully fetched ${stocksData.length} stocks from Yahoo Finance`);
          return NextResponse.json(stocksData);
        } else {
          console.warn('No stock data returned from Yahoo Finance');
          console.log('Returning fallback mock data instead');
          return NextResponse.json(FALLBACK_MOCK_DATA);
        }
      } catch (yahooError) {
        console.error('Error fetching from Yahoo Finance:', yahooError);
        console.log('Returning fallback mock data instead');
        return NextResponse.json(FALLBACK_MOCK_DATA);
      }
    } else {
      if (USE_YAHOO_FINANCE) {
        console.log('RapidAPI key not configured, using backend API');
      } else {
        console.log('Yahoo Finance integration is disabled, using backend API');
      }
    }
    
    // Call the Python backend to get stock data
    const response = await fetch(`${API_BASE_URL}/api/stocks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store',
    })
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Error from stocks API:', errorData)
      console.log('Returning fallback mock data instead');
      return NextResponse.json(FALLBACK_MOCK_DATA);
    }
    
    const data = await response.json()
    
    // If we got empty data, return fallback mock data instead of an error
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data returned from backend API, using fallback mock data');
      return NextResponse.json(FALLBACK_MOCK_DATA);
    }
    
    console.log(`Successfully fetched ${data.length} stocks from backend API`);
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing stocks request:', error)
    console.log('Returning fallback mock data instead');
    return NextResponse.json(FALLBACK_MOCK_DATA);
  }
}

// Helper function to determine sector from exchange (simplified)
function getSectorFromExchange(exchange: string): string {
  // In a real app, you would likely have a mapping of symbols to sectors
  // This is a simplified version just for display purposes
  const exchanges: Record<string, string> = {
    'NMS': 'Technology',
    'NGM': 'Technology',
    'NYQ': 'Finance',
    'PCX': 'Consumer Cyclical',
    'ASE': 'Healthcare',
  };
  
  return exchanges[exchange] || 'Other';
} 