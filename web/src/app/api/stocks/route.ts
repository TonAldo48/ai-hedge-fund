import { NextResponse } from 'next/server'

// Configuration for the Python backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Call the Python backend to get stock data
    const response = await fetch(`${API_BASE_URL}/api/stocks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Error from stocks API:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch stock data', details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing stocks request:', error)
    return NextResponse.json(
      { error: 'Failed to process stocks request' },
      { status: 500 }
    )
  }
} 