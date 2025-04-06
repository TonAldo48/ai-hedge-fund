import { NextResponse } from 'next/server';

// Base API URL, defaulting to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// GET a single simulation
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Simulation ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error fetching simulation ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to fetch simulation' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in simulation ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - update a simulation
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Simulation ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Get the simulation data from the request
    const simulationData = await request.json();
    
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationData),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error updating simulation ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to update simulation' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in update simulation ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a simulation
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Simulation ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error deleting simulation ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to delete simulation' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in delete simulation ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 