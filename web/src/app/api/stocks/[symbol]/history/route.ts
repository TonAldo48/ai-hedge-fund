import { NextResponse } from 'next/server'
import { getHistoricalData, mapTimeframeToYahoo, formatHistoricalData, isRapidAPIConfigured } from '@/lib/yahoo-finance'

// Configuration for the Python backend (fallback)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
// Flag to enable direct Yahoo Finance data fetching
const USE_YAHOO_FINANCE = process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE === 'true'

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // Ensure params is properly awaited
  const symbol = params.symbol
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe') || '3M'
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }
  
  try {
    // First try Yahoo Finance direct fetch if enabled
    if (USE_YAHOO_FINANCE && isRapidAPIConfigured()) {
      try {
        console.log(`Fetching historical data for ${symbol} from Yahoo Finance (RapidAPI) with timeframe ${timeframe}`)
        
        // Convert our API timeframe format to Yahoo timeframe
        const { period, interval } = mapTimeframeToYahoo(timeframe)
        
        // Get data from Yahoo Finance
        const historicalData = await getHistoricalData(symbol, period, interval)
        
        if (historicalData && historicalData.length > 0) {
          // Format data to match our API's expected format
          const formattedData = formatHistoricalData(historicalData)
          
          // Return with the same structure as our backend API
          return NextResponse.json({
            symbol,
            timeframe,
            history: formattedData,
            source: 'Yahoo Finance',
            lastUpdated: new Date().toISOString()
          })
        } else {
          console.warn(`No data returned from Yahoo Finance for ${symbol}, falling back to backend API`)
        }
      } catch (yahooError) {
        console.error(`Error fetching from Yahoo Finance for ${symbol}:`, yahooError)
        console.log('Falling back to backend API')
      }
    } else if (USE_YAHOO_FINANCE) {
      console.log('RapidAPI key not configured, using backend API');
    } else {
      console.log('Yahoo Finance integration is disabled, using backend API');
    }
    
    // Fallback to the Python backend
    const response = await fetch(
      `${API_BASE_URL}/api/stocks/${symbol}/history?timeframe=${timeframe}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error(`Error from stock history API for ${symbol}:`, errorData)
      return NextResponse.json(
        { error: `Failed to fetch history for ${symbol}`, details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error processing stock history request for ${symbol}:`, error)
    return NextResponse.json(
      { error: `Failed to process history request for ${symbol}` },
      { status: 500 }
    )
  }
} 