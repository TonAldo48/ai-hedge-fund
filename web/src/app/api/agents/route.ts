import { NextResponse } from 'next/server';

// Base API URL, defaulting to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// GET all agents
export async function GET() {
  try {
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error fetching agents:', errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to fetch agents' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in agents API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - create a new agent
export async function POST(request: Request) {
  try {
    // Get the agent data from the request
    const agentData = await request.json();
    
    // Forward request to Python backend
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error creating agent:', errorData || response.statusText);
      
      return NextResponse.json(
        { error: errorData || 'Failed to create agent' },
        { status: response.status }
      );
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in create agent API route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 