import { NextResponse } from 'next/server'
import { getPrices, getQuote, isFinancialDatasetsConfigured } from '@/lib/financial-datasets'

// Configuration for the API
const USE_FINANCIAL_DATASETS = process.env.NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY ? true : false

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }
  
  console.log(`Direct Financial API quote lookup for: ${symbol}`)
  
  try {
    // Check if Financial Datasets API is configured
    if (!USE_FINANCIAL_DATASETS || !isFinancialDatasetsConfigured()) {
      console.error('Financial Datasets API not configured')
      return NextResponse.json(
        { error: 'Financial data service is not available' },
        { status: 503 }
      )
    }
    
    // Try to get a direct quote first
    const quoteData = await getQuote(symbol)
    
    if (quoteData) {
      return NextResponse.json({
        symbol: symbol,
        name: quoteData.name || symbol,
        price: quoteData.price || quoteData.close,
        change: quoteData.change || 0,
        changePercent: quoteData.changePercent || 0,
        source: 'Financial Datasets API (Direct)',
        lastUpdated: new Date().toISOString()
      })
    }
    
    // Fall back to historical price as a last resort
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 7)
    
    const endDate = today.toISOString().split('T')[0]
    const startDate = lastWeek.toISOString().split('T')[0]
    
    const priceData = await getPrices(symbol, startDate, endDate, 'day', 1)
    
    if (priceData && priceData.length > 0) {
      // Sort to get the most recent price
      const sortedPrices = [...priceData].sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      )
      
      const latestPrice = sortedPrices[0]
      
      // Find previous day for change calculation
      let change = 0
      let changePercent = 0
      
      if (sortedPrices.length > 1) {
        const previousPrice = sortedPrices[1]
        change = latestPrice.close - previousPrice.close
        changePercent = (change / previousPrice.close) * 100
      }
      
      return NextResponse.json({
        symbol: symbol,
        name: symbol, // We only have the symbol in this case
        price: latestPrice.close,
        change: change,
        changePercent: changePercent,
        source: 'Financial Datasets API (Historical)',
        lastUpdated: new Date().toISOString()
      })
    }
    
    // If we got here, we couldn't find any data
    return NextResponse.json(
      { error: `No data available for symbol "${symbol}"` },
      { status: 404 }
    )
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch data for "${symbol}"` },
      { status: 500 }
    )
  }
} 