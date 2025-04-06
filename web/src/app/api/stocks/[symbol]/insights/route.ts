import { NextResponse } from 'next/server';

// Base API URL, defaulting to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  
  // Return 400 if symbol is not provided
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/insights`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error fetching insights for ${symbol}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to fetch analyst insights' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in analyst insights API route for ${symbol}:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 