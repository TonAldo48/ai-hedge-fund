import { NextResponse } from 'next/server'

// Configuration for the Python backend
// Use explicit IPv4 address to avoid IPv6 resolution issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export async function GET() {
  console.log(`Fetching stocks from API: ${API_BASE_URL}/api/stocks`);
  
  try {
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
      return NextResponse.json(
        { error: 'Failed to fetch stock data', details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log(`Successfully fetched ${data.length} stocks`);
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing stocks request:', error)
    return NextResponse.json(
      { error: 'Failed to process stocks request' },
      { status: 500 }
    )
  }
} 