// Test script to debug API connection issues
// No need to require node-fetch as fetch is now available in Node.js

// Use explicit IPv4 address to avoid IPv6 resolution issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

async function testAPI() {
  console.log(`Testing API connection to: ${API_BASE_URL}/api/stocks`);
  
  try {
    // Test the Python backend endpoint
    console.log('1. Testing direct connection to Python backend:');
    const backendResponse = await fetch(`${API_BASE_URL}/api/stocks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Backend response status: ${backendResponse.status}`);
    
    if (!backendResponse.ok) {
      try {
        const errorData = await backendResponse.json();
        console.error('Error data from backend:', errorData);
      } catch (e) {
        console.error('Could not parse error response from backend');
      }
    } else {
      const data = await backendResponse.json();
      console.log(`Successfully fetched ${data.length} stocks from backend`);
      console.log('First stock:', data[0]);
    }
    
    // Test the Next.js API endpoint
    console.log('\n2. Testing Next.js API endpoint:');
    const nextjsResponse = await fetch('http://localhost:3000/api/stocks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Next.js API response status: ${nextjsResponse.status}`);
    
    if (!nextjsResponse.ok) {
      try {
        const errorData = await nextjsResponse.json();
        console.error('Error data from Next.js API:', errorData);
      } catch (e) {
        console.error('Could not parse error response from Next.js API');
      }
    } else {
      const data = await nextjsResponse.json();
      console.log(`Successfully fetched ${data.length} stocks from Next.js API`);
      console.log('First stock:', data[0]);
    }
    
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

testAPI(); 