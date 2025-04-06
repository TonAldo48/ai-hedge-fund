import { NextResponse } from 'next/server';

// Base API URL, defaulting to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// GET a single agent
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Agent ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error fetching agent ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to fetch agent' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in agent ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - update an agent
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Agent ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Get the agent data from the request
    const agentData = await request.json();
    
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error updating agent ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to update agent' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in update agent ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE an agent
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Return 400 if id is not provided
  if (!id) {
    return NextResponse.json(
      { error: 'Agent ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Error deleting agent ${id}:`, errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to delete agent' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error(`Error in delete agent ${id} API route:`, error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 