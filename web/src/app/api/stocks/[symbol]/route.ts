import { NextResponse } from 'next/server'
import { getQuote, isRapidAPIConfigured } from '@/lib/yahoo-finance'
import { getQuote as getAlphaVantageQuote, getCompanyOverview, isAlphaVantageConfigured } from '@/lib/alpha-vantage'
import { getCompanyFactsByTicker, isFinancialDatasetsConfigured } from '@/lib/financial-datasets'

// Configuration for the Python backend (fallback)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
// Flag to enable direct Yahoo Finance data fetching
const USE_YAHOO_FINANCE = process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE === 'true'

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // Ensure params is properly awaited
  const symbol = params.symbol
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400, headers }
    )
  }
  
  try {
    console.log(`API route called for symbol: ${symbol}`)
    
    // Try to get company facts from Financial Datasets API first
    if (isFinancialDatasetsConfigured()) {
      console.log(`Financial Datasets API is configured, trying to fetch company facts for ${symbol}`)
      const companyFacts = await getCompanyFactsByTicker(symbol)
      
      if (companyFacts) {
        console.log(`Got company facts for ${symbol} from Financial Datasets API`)
        
        // Now get price data from Yahoo Finance or Alpha Vantage
        let priceData = null
        let dataSource = 'Financial Datasets API'
        
        // Try Yahoo Finance for price data if enabled
        if (USE_YAHOO_FINANCE && isRapidAPIConfigured()) {
          try {
            console.log(`Fetching price data for ${symbol} from Yahoo Finance (RapidAPI)`)
            const quoteData = await getQuote(symbol)
            
            if (quoteData) {
              priceData = {
                price: quoteData.regularMarketPrice,
                change: quoteData.regularMarketChange,
                changePercent: quoteData.regularMarketChangePercent,
                volume: quoteData.regularMarketVolume,
                high52: quoteData.fiftyTwoWeekHigh,
                low52: quoteData.fiftyTwoWeekLow,
              }
              dataSource = 'Financial Datasets API + Yahoo Finance'
            }
          } catch (yahooError) {
            console.error(`Error fetching price from Yahoo Finance for ${symbol}:`, yahooError)
          }
        }
        
        // Try Alpha Vantage as fallback for price data
        if (!priceData && isAlphaVantageConfigured()) {
          try {
            console.log(`Fetching price data for ${symbol} from Alpha Vantage`)
            const quoteData = await getAlphaVantageQuote(symbol)
            
            if (quoteData) {
              priceData = {
                price: quoteData.price,
                change: quoteData.change,
                changePercent: quoteData.changePercent,
                volume: quoteData.volume,
              }
              dataSource = 'Financial Datasets API + Alpha Vantage'
            }
          } catch (alphaVantageError) {
            console.error(`Error fetching price from Alpha Vantage for ${symbol}:`, alphaVantageError)
          }
        }
        
        // Format data combining company facts and price data
        const formattedData = {
          symbol: symbol,
          name: companyFacts.name,
          price: priceData?.price || 0,
          change: priceData?.change || 0,
          changePercent: priceData?.changePercent || 0,
          volume: priceData?.volume || companyFacts.weighted_average_shares || 0,
          marketCap: companyFacts.market_cap,
          high52: priceData?.high52,
          low52: priceData?.low52,
          pe: undefined, // Can be added if available
          dividend: undefined, // Can be added if available
          yield: undefined, // Can be added if available
          beta: undefined, // Can be added if available
          sector: companyFacts.sector,
          industry: companyFacts.industry,
          category: companyFacts.category,
          exchange: companyFacts.exchange,
          employees: companyFacts.number_of_employees,
          website: companyFacts.website_url,
          description: `${companyFacts.name} is a company in the ${companyFacts.sector} sector.`,
          // Add data source information
          source: dataSource,
          lastUpdated: new Date().toISOString(),
        }
        
        console.log(`Returning formatted data for ${symbol}: ${JSON.stringify(formattedData).substring(0, 200)}...`)
        
        return NextResponse.json(formattedData, { headers })
      } else {
        console.log(`No company facts found for ${symbol}, trying other data sources`)
      }
    } else {
      console.log('Financial Datasets API is not configured, trying other data sources')
    }

    // First try Yahoo Finance direct fetch if enabled and no company facts
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
          
          return NextResponse.json(formattedData, { headers })
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
          
          return NextResponse.json(formattedData, { headers })
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
    console.log(`Falling back to Python backend for ${symbol}`)
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
        { status: response.status, headers }
      )
    }
    
    const data = await response.json()
    console.log(`Returning data from Python backend for ${symbol}`)
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error(`Error processing stock request for ${symbol}:`, error)
    return NextResponse.json(
      { error: `Failed to process request for ${symbol}` },
      { status: 500, headers }
    )
  }
} 