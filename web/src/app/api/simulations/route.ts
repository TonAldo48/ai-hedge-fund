import { NextResponse } from 'next/server';

// Base API URL, defaulting to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// GET all saved simulations
export async function GET() {
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error fetching simulations:', errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to fetch simulations' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in simulations API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - save a simulation
export async function POST(request: Request) {
  try {
    // Get the simulation data from the request
    const simulationData = await request.json();
    
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationData),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error saving simulation:', errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to save simulation' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in save simulation API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 