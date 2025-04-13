import { NextResponse } from 'next/server';
import { getPrices, isFinancialDatasetsConfigured } from '@/lib/financial-datasets';

export async function GET() {
  // Collect debugging information
  const apiKey = process.env.NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY;
  const debugInfo = {
    environment: {
      NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}` : 'Not Set',
      apiKeyLength: apiKey?.length || 0,
      NEXT_PUBLIC_USE_YAHOO_FINANCE: process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE,
      NODE_ENV: process.env.NODE_ENV,
    },
    configuration: {
      isFinancialDatasetsConfigured: isFinancialDatasetsConfigured(),
    },
    timestamp: new Date().toISOString(),
  };

  // Test the Financial Datasets API
  let apiTestResult = null;
  let apiTestError = null;

  if (isFinancialDatasetsConfigured()) {
    try {
      console.log('Testing Financial Datasets API with AAPL...');
      console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}` : 'Not Set'}`);
      
      // Get today's date and 30 days ago
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      
      const endDateStr = today.toISOString().split('T')[0];
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Try to fetch data directly
      const prices = await getPrices(
        'AAPL', 
        startDateStr,
        endDateStr,
        'day',
        1
      );
      
      apiTestResult = {
        success: true,
        dataPoints: prices.length,
        firstFewPoints: prices.slice(0, 3),
      };
    } catch (error) {
      console.error('Error testing Financial Datasets API:', error);
      apiTestResult = {
        success: false,
      };
      apiTestError = {
        message: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  } else {
    apiTestResult = {
      success: false,
      reason: 'Financial Datasets API not configured',
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
    };
  }

  return NextResponse.json({
    status: 'Debug endpoint active',
    debugInfo,
    apiTest: {
      result: apiTestResult,
      error: apiTestError,
    },
  });
} 