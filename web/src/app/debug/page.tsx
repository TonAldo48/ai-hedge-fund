'use client';

import { useEffect, useState } from 'react';
import { isFinancialDatasetsConfigured } from '@/lib/financial-datasets';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>({ loading: false, result: null, error: null });

  useEffect(() => {
    // Collect environment variables
    setEnvVars({
      NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY: process.env.NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY ? 'Set (Hidden)' : 'Not Set',
      NEXT_PUBLIC_USE_YAHOO_FINANCE: process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE,
      isFinancialDatasetsConfigured: isFinancialDatasetsConfigured(),
    });
  }, []);

  const testFinancialDatasetsApi = async () => {
    setApiTest({ loading: true, result: null, error: null });
    try {
      // Try to fetch AAPL history data directly
      const response = await fetch('/api/stocks/AAPL/history?timeframe=1M');
      const data = await response.json();
      setApiTest({ loading: false, result: data, error: null });
    } catch (error) {
      setApiTest({ loading: false, result: null, error: String(error) });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Test</h2>
        <button 
          onClick={testFinancialDatasetsApi} 
          disabled={apiTest.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {apiTest.loading ? 'Testing...' : 'Test Financial Datasets API'}
        </button>
        
        {apiTest.result && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
              {JSON.stringify(apiTest.result, null, 2)}
            </pre>
          </div>
        )}
        
        {apiTest.error && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-red-500">Error:</h3>
            <pre className="bg-red-50 text-red-700 p-4 rounded overflow-auto max-h-60">
              {apiTest.error}
            </pre>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Console Output</h2>
        <p className="text-gray-600">Check your browser console for debug logs from the Financial Datasets module.</p>
      </div>
    </div>
  );
} 