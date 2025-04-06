import { NextResponse } from 'next/server'
import { SimulationConfig } from '@/lib/api'

// Configuration for the Python backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const config: SimulationConfig = await request.json()
    
    // Call the Python backend
    const response = await fetch(`${API_BASE_URL}/api/simulation/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Error from simulation API:', errorData)
      return NextResponse.json(
        { error: 'Failed to run simulation', details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing simulation request:', error)
    return NextResponse.json(
      { error: 'Failed to process simulation request' },
      { status: 500 }
    )
  }
} 