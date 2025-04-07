import { NextResponse } from 'next/server'
import { getQuote, isRapidAPIConfigured } from '@/lib/yahoo-finance'
import { getQuote as getAlphaVantageQuote, getCompanyOverview, isAlphaVantageConfigured } from '@/lib/alpha-vantage'

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
        console.log(`Fetching quote data for ${symbol} from Yahoo Finance (RapidAPI)`)
        
        // Get data from Yahoo Finance
        const quoteData = await getQuote(symbol)
        
        if (quoteData) {
          // Format data to match our API's expected format
          const formattedData = {
            symbol: quoteData.symbol,
            name: quoteData.longName || quoteData.shortName || symbol,
            price: quoteData.regularMarketPrice,
            change: quoteData.regularMarketChange,
            changePercent: quoteData.regularMarketChangePercent,
            volume: quoteData.regularMarketVolume,
            marketCap: quoteData.marketCap,
            high52: quoteData.fiftyTwoWeekHigh,
            low52: quoteData.fiftyTwoWeekLow,
            pe: quoteData.trailingPE,
            dividend: quoteData.trailingAnnualDividendRate,
            yield: quoteData.trailingAnnualDividendYield ? quoteData.trailingAnnualDividendYield * 100 : undefined,
            // Add data source information
            source: 'Yahoo Finance',
            lastUpdated: new Date().toISOString(),
          }
          
          return NextResponse.json(formattedData)
        } else {
          console.warn(`No quote data returned from Yahoo Finance for ${symbol}, trying Alpha Vantage`)
        }
      } catch (yahooError) {
        console.error(`Error fetching from Yahoo Finance for ${symbol}:`, yahooError)
        console.log('Trying Alpha Vantage as fallback')
      }
    } else if (USE_YAHOO_FINANCE) {
      console.log('RapidAPI key not configured, trying Alpha Vantage');
    } else {
      console.log('Yahoo Finance integration is disabled, trying Alpha Vantage');
    }
    
    // Try Alpha Vantage as a second option
    if (isAlphaVantageConfigured()) {
      try {
        console.log(`Fetching quote data for ${symbol} from Alpha Vantage`)
        
        // Get basic quote data
        const quoteData = await getAlphaVantageQuote(symbol)
        
        if (quoteData) {
          // Try to get additional company data
          let companyData = null
          try {
            companyData = await getCompanyOverview(symbol)
          } catch (overviewError) {
            console.warn(`Could not fetch company overview for ${symbol}:`, overviewError)
          }
          
          // Format combined data
          const formattedData = {
            symbol: quoteData.symbol,
            name: companyData?.Name || symbol,
            price: quoteData.price,
            change: quoteData.change,
            changePercent: quoteData.changePercent,
            volume: quoteData.volume,
            marketCap: companyData?.MarketCapitalization ? parseInt(companyData.MarketCapitalization) : undefined,
            high52: companyData?.['52WeekHigh'] ? parseFloat(companyData['52WeekHigh']) : undefined,
            low52: companyData?.['52WeekLow'] ? parseFloat(companyData['52WeekLow']) : undefined,
            pe: companyData?.PERatio ? parseFloat(companyData.PERatio) : undefined,
            dividend: companyData?.DividendPerShare ? parseFloat(companyData.DividendPerShare) : undefined,
            yield: companyData?.DividendYield ? parseFloat(companyData.DividendYield) * 100 : undefined,
            beta: companyData?.Beta ? parseFloat(companyData.Beta) : undefined,
            sector: companyData?.Sector,
            description: companyData?.Description,
            // Add data source information
            source: 'Alpha Vantage',
            lastUpdated: new Date().toISOString(),
          }
          
          return NextResponse.json(formattedData)
        } else {
          console.warn(`No quote data returned from Alpha Vantage for ${symbol}, falling back to backend API`)
        }
      } catch (alphaVantageError) {
        console.error(`Error fetching from Alpha Vantage for ${symbol}:`, alphaVantageError)
        console.log('Falling back to backend API')
      }
    } else {
      console.log('Alpha Vantage API key not configured, using backend API');
    }
    
    // Fallback to the Python backend
    const response = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error(`Error from stock API for ${symbol}:`, errorData)
      return NextResponse.json(
        { error: `Failed to fetch details for ${symbol}`, details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error processing stock request for ${symbol}:`, error)
    return NextResponse.json(
      { error: `Failed to process request for ${symbol}` },
      { status: 500 }
    )
  }
} 