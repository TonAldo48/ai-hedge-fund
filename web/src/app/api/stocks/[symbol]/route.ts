import { NextResponse } from 'next/server'

// Configuration for the Python backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol is required' },
      { status: 400 }
    )
  }
  
  try {
    // Call the Python backend to get specific stock data
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
        { error: `Failed to fetch data for ${symbol}`, details: errorData },
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