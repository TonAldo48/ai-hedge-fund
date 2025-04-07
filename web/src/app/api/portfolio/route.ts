import { NextResponse } from 'next/server'

// Configuration for the Python backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const TIMEOUT_MS = 10000 // 10 seconds timeout

// Helper function to implement timeout for fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

export async function GET() {
  try {
    // Call the Python backend to get portfolio data with timeout
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/portfolio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // In a real app, we would include authentication headers
      // headers: {
      //   'Authorization': `Bearer ${token}`,
      // },
    }, TIMEOUT_MS);
    
    if (!response.ok) {
      let errorMessage = `API responded with status ${response.status}`;
      
      try {
        const errorData = await response.json().catch(() => null);
        console.error('Error from portfolio API:', errorData);
        
        return NextResponse.json(
          { error: 'Failed to fetch portfolio data', details: errorData },
          { status: response.status }
        );
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing portfolio request:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out when connecting to portfolio API' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process portfolio request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 