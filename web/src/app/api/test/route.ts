import { NextResponse } from 'next/server'
import { testFinancialDatasetsAPI, getCompanyFactsByTicker, isFinancialDatasetsConfigured } from '@/lib/financial-datasets'

export async function GET() {
  try {
    // Check if API is configured
    const isConfigured = isFinancialDatasetsConfigured()
    console.log(`Financial Datasets API is configured: ${isConfigured}`)
    
    // Get the API key value (masked for security)
    const apiKey = process.env.NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY
    const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
    console.log(`API Key: ${maskedKey || 'Not set'}`)
    
    // Test the Financial Datasets API with NVDA
    console.log('Testing Financial Datasets API...')
    const testResult = await testFinancialDatasetsAPI('NVDA')
    
    // Get company facts directly
    console.log('Getting company facts directly...')
    const facts = await getCompanyFactsByTicker('NVDA')
    
    return NextResponse.json({
      isConfigured,
      apiKeyPresent: !!apiKey,
      testResult,
      facts: facts || 'No facts found'
    })
  } catch (error) {
    console.error('Error in test route:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 