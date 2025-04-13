# Setting Up Financial Datasets API for AI Hedge Fund

This guide will help you set up and use the Financial Datasets API in your AI Hedge Fund project.

## 1. Create an Account

1. Visit [Financial Datasets API](https://www.financialdatasets.ai/) and sign up for an account.
2. After creating your account, you can start with the free tier or choose a paid plan:
   - **Free Plan**: 250 requests per day, US data only, 5 years of stock data
   - **Starter Plan** ($29/month): 300 API calls per minute, 30+ years of data
   - **Premium Plan** ($69/month): 750 API calls per minute, advanced data
   - **Ultimate Plan** ($139/month): 3,000 API calls per minute, comprehensive data

## 2. Get Your API Key

1. After signing in, navigate to your account dashboard.
2. Copy your API key, which will be used to authenticate your requests.

## 3. Configure Your Environment

1. Add your API key to your `.env` file:

```
# For getting financial data to power the hedge fund
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# For frontend API calls
NEXT_PUBLIC_FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
```

2. If you wish to disable Yahoo Finance as a fallback, set:

```
NEXT_PUBLIC_USE_YAHOO_FINANCE=false
```

## 4. Available Endpoints

The integration currently supports the following endpoints:

### 4.1 Prices API

```typescript
// Get historical price data
const prices = await getPrices(
  symbol,             // Stock symbol (e.g., 'AAPL')
  startDate,          // Start date in YYYY-MM-DD format
  endDate,            // End date in YYYY-MM-DD format
  interval,           // Time interval (second, minute, day, week, month, year)
  intervalMultiplier  // Multiplier for the interval (must be ≥ 1)
);
```

### 4.2 Available Tickers

```typescript
// Get list of available tickers
const tickers = await getAvailableTickers();
```

## 5. API Limits & Best Practices

To make the most efficient use of your API quota:

1. **Use the Cache System**: The system will cache results to reduce redundant API calls
2. **Batch Requests**: When possible, use bulk endpoints to fetch multiple items in a single call
3. **Time-Based Fetching**: Only fetch recent data when displaying current prices and fetch historical data less frequently
4. **Error Handling**: Implement proper error handling to manage API limits and fallbacks

## 6. Testing Your Setup

1. Run the development server:

```bash
cd web && npm run dev:all
```

2. Open your browser and navigate to `http://localhost:3000`
3. Check browser console for API status messages
4. Verify that stock data is being fetched from Financial Datasets API

## 7. Fallback Mechanism

The system uses a fallback mechanism in the following order:

1. Financial Datasets API (primary source)
2. Yahoo Finance API (if configured)
3. Backend FastAPI server
4. Mock data (as a last resort)

## 8. Troubleshooting

If you encounter issues:

1. **API Key Validation**: Ensure your API key is valid and properly set in the `.env` files
2. **CORS Issues**: If you get CORS errors, check that your API key has proper permissions
3. **Rate Limiting**: If you hit rate limits, consider upgrading your plan or optimizing your API calls
4. **Data Availability**: Some tickers may only be available on paid plans

## 9. Additional Resources

- [Financial Datasets API Documentation](https://www.financialdatasets.ai/documentation)
- [API Integration Plan](./financial-datasets-api-plan.md)

For any questions or assistance, please contact support@financialdatasets.ai 