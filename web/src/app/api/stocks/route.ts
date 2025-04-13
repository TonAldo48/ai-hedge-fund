import { NextResponse } from 'next/server'
import { getQuote, isRapidAPIConfigured } from '@/lib/yahoo-finance'
import { getPrices, isFinancialDatasetsConfigured } from '@/lib/financial-datasets' 

// Configuration for the Python backend
// Use explicit IPv4 address to avoid IPv6 resolution issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
// Flag to enable direct Yahoo Finance data fetching
const USE_YAHOO_FINANCE = process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE === 'true'
// Flag to enable Financial Datasets API
const USE_FINANCIAL_DATASETS = process.env.NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY ? true : false

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
  console.log(`NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY configured: ${isFinancialDatasetsConfigured()}`);
  console.log(`NEXT_PUBLIC_USE_YAHOO_FINANCE=${process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE}`);
  console.log(`RAPIDAPI_KEY configured: ${isRapidAPIConfigured()}`);
  console.log(`USE_FINANCIAL_DATASETS flag=${USE_FINANCIAL_DATASETS}`);
  console.log(`USE_YAHOO_FINANCE flag=${USE_YAHOO_FINANCE}`);
  console.log('=============================================');
  
  try {
    // First try Financial Datasets API if enabled
    if (USE_FINANCIAL_DATASETS && isFinancialDatasetsConfigured()) {
      try {
        console.log('Fetching stock data from Financial Datasets API');
        
        // Get today's date and yesterday's date for recent price data
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 7); // Use 7 days to ensure we get some data even on weekends
        
        const endDate = today.toISOString().split('T')[0];
        const startDate = yesterday.toISOString().split('T')[0];
        
        // Fetch prices for all default symbols in parallel
        const pricePromises = DEFAULT_SYMBOLS.map(symbol => 
          getPrices(symbol, startDate, endDate, 'day', 1)
        );
        
        const pricesResults = await Promise.all(pricePromises);
        
        // Process the price data to create stock summaries
        const stocksData = pricesResults
          .map((prices, index) => {
            const symbol = DEFAULT_SYMBOLS[index];
            
            // Skip if no price data
            if (!prices || prices.length === 0) {
              console.warn(`No price data for ${symbol} from Financial Datasets API`);
              return null;
            }
            
            // Sort by date to get the latest
            const sortedPrices = [...prices].sort((a, b) => 
              new Date(b.time).getTime() - new Date(a.time).getTime()
            );
            
            const latestPrice = sortedPrices[0];
            
            // Find previous day price for change calculation
            let previousPrice = null;
            if (sortedPrices.length > 1) {
              previousPrice = sortedPrices[1];
            }
            
            let change = 0;
            let changePercent = 0;
            
            if (previousPrice) {
              change = latestPrice.close - previousPrice.close;
              changePercent = (change / previousPrice.close) * 100;
            }
            
            return {
              symbol: symbol,
              name: getCompanyName(symbol), // Helper function to get company name
              price: latestPrice.close,
              open: latestPrice.open,
              high: latestPrice.high,
              low: latestPrice.low,
              change: change,
              changePercent: changePercent,
              volume: latestPrice.volume,
              // We don't have market cap from the price data
              // This would need to be fetched from another endpoint
              sector: getSectorForSymbol(symbol),
              dataSource: 'Financial Datasets API'
            };
          })
          .filter(stock => stock !== null); // Remove nulls
        
        if (stocksData && stocksData.length > 0) {
          console.log(`Successfully fetched ${stocksData.length} stocks from Financial Datasets API`);
          return NextResponse.json({
            stocks: stocksData,
            source: 'Financial Datasets API',
            apiImplementation: 'financial-datasets.ts',
            dataSourceDetails: {
              provider: 'Financial Datasets API',
              apiKey: 'configured',
              dataPoints: stocksData.length,
              module: 'financial-datasets.ts'
            },
            lastUpdated: new Date().toISOString()
          });
        } else {
          console.warn('No stock data returned from Financial Datasets API');
          console.log('Falling back to Yahoo Finance or backend API');
        }
      } catch (financialDatasetsError) {
        console.error('Error fetching from Financial Datasets API:', financialDatasetsError);
        console.log('Falling back to Yahoo Finance or backend API');
      }
    } else {
      console.log('Financial Datasets API not configured, falling back to other data sources');
    }
    
    // Try Yahoo Finance as fallback if enabled
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
              dataSource: 'Yahoo Finance'
            };
          });
        
        if (stocksData && stocksData.length > 0) {
          console.log(`Successfully fetched ${stocksData.length} stocks from Yahoo Finance`);
          return NextResponse.json({
            stocks: stocksData,
            source: 'Yahoo Finance',
            apiImplementation: 'yahoo-finance.ts',
            dataSourceDetails: {
              provider: 'Yahoo Finance API',
              apiKey: 'configured',
              dataPoints: stocksData.length,
            },
            lastUpdated: new Date().toISOString()
          });
        } else {
          console.warn('No stock data returned from Yahoo Finance');
          console.log('Falling back to backend API');
        }
      } catch (yahooError) {
        console.error('Error fetching from Yahoo Finance:', yahooError);
        console.log('Falling back to backend API');
      }
    } else if (USE_YAHOO_FINANCE) {
      console.log('RapidAPI key not configured, using backend API');
    } else {
      console.log('Yahoo Finance integration is disabled, using backend API');
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
      return NextResponse.json({
        stocks: FALLBACK_MOCK_DATA,
        source: 'Fallback Mock Data',
        apiImplementation: 'mock-data',
        lastUpdated: new Date().toISOString()
      });
    }
    
    const data = await response.json()
    
    // If we got empty data, return fallback mock data instead of an error
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data returned from backend API, using fallback mock data');
      return NextResponse.json({
        stocks: FALLBACK_MOCK_DATA,
        source: 'Fallback Mock Data',
        apiImplementation: 'mock-data',
        lastUpdated: new Date().toISOString()
      });
    }
    
    console.log(`Successfully fetched ${data.length} stocks from backend API`);
    
    // Ensure consistent response format with stocks property
    return NextResponse.json({
      stocks: data,
      source: 'Python Backend API',
      apiImplementation: 'backend-api',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing stocks request:', error)
    console.log('Returning fallback mock data instead');
    return NextResponse.json({
      stocks: FALLBACK_MOCK_DATA,
      source: 'Fallback Mock Data (Error)',
      apiImplementation: 'mock-data',
      lastUpdated: new Date().toISOString()
    });
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

// Helper function to get company name from symbol
function getCompanyName(symbol: string): string {
  // Simplified mapping for common stocks
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla, Inc.',
    'META': 'Meta Platforms, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.'
  };
  
  return companyNames[symbol] || symbol;
}

// Helper function to get sector for a symbol
function getSectorForSymbol(symbol: string): string {
  // Simplified mapping for common stocks
  const sectors: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'AMZN': 'Consumer Cyclical',
    'TSLA': 'Automotive',
    'META': 'Technology',
    'NVDA': 'Technology',
    'JPM': 'Financial Services',
    'V': 'Financial Services',
    'WMT': 'Consumer Defensive'
  };
  
  return sectors[symbol] || 'Other';
} 