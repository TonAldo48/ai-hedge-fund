# Financial Datasets API Integration Plan

## 1. API Overview

Financial Datasets API (https://www.financialdatasets.ai) provides comprehensive financial data including:
- Stock price data
- Financial statements
- Financial metrics
- Company facts/profiles
- Insider trading information
- News sentiment

## 2. Data Requirements

Here's the data we need to collect for our AI hedge fund:

### Core Financial Data
1. **Price Data**
   - Historical daily prices (OHLCV)
   - Real-time price updates

2. **Fundamental Data**
   - Income statements
   - Balance sheets
   - Cash flow statements
   - Financial ratios/metrics

3. **Supporting Data**
   - Company profiles/facts
   - Insider trading activity
   - News and sentiment data
   - Market-wide indicators

## 3. Implementation Steps

### Phase 1: API Connection & Basic Data Collection
1. **Setup API Key Management**
   - Update `.env` file to include FINANCIAL_DATASETS_API_KEY
   - Ensure secure handling of API keys

2. **Enhance Existing API Tools**
   - Current implementation in `src/tools/api.py` already has functions for:
     - `get_prices`
     - `get_financial_metrics` 
     - `search_line_items`
     - `get_insider_trades`
     - `get_company_news`

3. **Add Missing API Functions**
   - Company profile/facts data
   - Sector/industry information
   - Full financial statements

### Phase 2: Data Models & Storage
1. **Expand Pydantic Models**
   - Extend existing models in `src/data/models.py` for new data types
   - Add models for complete financial statements

2. **Optimize Caching**
   - Improve the caching system to reduce API calls
   - Implement time-based cache expiration

### Phase 3: Advanced Data Capabilities
1. **Data Preprocessing**
   - Financial ratio calculations
   - Technical indicators
   - Time series normalization

2. **Market-Wide Data**
   - Index data
   - Sector performance
   - Economic indicators

## 4. Agent Integration

For each investing agent, we need to provide relevant data:

1. **Warren Buffett & Charlie Munger Agents**
   - Financial statements (5-10 years)
   - Long-term metrics and ratios
   - Quality indicators (ROIC, margins)

2. **Bill Ackman Agent**
   - Insider activity
   - Corporate governance data
   - Ownership structure

3. **Cathie Wood Agent**
   - Growth metrics
   - Innovation indicators
   - Disruptive technology data

4. **Peter Lynch & Phil Fisher Agents**
   - Company growth metrics
   - Industry position data
   - Competitive analysis

5. **Technical & Sentiment Agents**
   - Price patterns
   - News sentiment
   - Social media indicators

## 5. UI Integration

1. **Dashboard Data**
   - Company profile display
   - Financial metrics visualization
   - Performance charts

2. **Portfolio Analytics**
   - Holdings analysis
   - Performance attribution
   - Risk metrics

## 6. Implementation Priority

1. Core price and financial metrics data (already implemented)
2. Complete financial statements
3. Company profile/facts
4. News and sentiment
5. Insider trading information
6. Market-wide indicators

## 7. API Authentication

The Financial Datasets API requires an API key for authentication:

1. **Free Tier Limitations**
   - 250 requests per day
   - US data only
   - 5 years of stock data
   - 5 quarters of financial statement data

2. **Paid Tiers**
   - Starter Plan ($29/month): 300 API calls per minute, 30+ years of data
   - Premium Plan ($69/month): 750 API calls per minute, advanced data
   - Ultimate Plan ($139/month): 3,000 API calls per minute, comprehensive data

3. **API Key Setup**
   ```python
   headers = {}
   if api_key := os.environ.get("FINANCIAL_DATASETS_API_KEY"):
       headers["X-API-KEY"] = api_key
   
   # Example API call
   url = "https://api.financialdatasets.ai/endpoint"
   response = requests.get(url, headers=headers)
   ```

## 8. Detailed API Endpoints

### 8.1 Prices API Endpoint

The Prices API is the core endpoint for retrieving historical price data for stocks:

**Endpoint**: `GET https://api.financialdatasets.ai/prices/`

**Description**: Get ranged price data for a ticker to power stock charts and analyze price movements. The data comes directly from verified exchanges like NASDAQ, NYSE, and AMEX.

**Use Cases**:
- Backtesting trading strategies
- Analyzing price patterns
- Rendering charts
- Price movement analysis

**Query Parameters**:
- `ticker` (string, required): The ticker symbol
- `interval` (enum, required): Time interval for price data
  - Options: `second`, `minute`, `day`, `week`, `month`, `year`
- `interval_multiplier` (integer, required): Multiplier for the interval (must be ≥ 1)
- `start_date` (string, required): Start date in YYYY-MM-DD format
- `end_date` (string, required): End date in YYYY-MM-DD format
- `limit` (integer, optional): Maximum number of records to return (default: 5000, max: 5000)

**Sample Implementation**:
```python
import requests

# Add API key to headers
headers = {
    "X-API-KEY": os.environ.get("FINANCIAL_DATASETS_API_KEY")
}

# Set query parameters
ticker = 'AAPL'
interval = 'day'  
interval_multiplier = 1     
start_date = '2024-01-01'
end_date = '2024-12-31'

# Create URL
url = (
    f'https://api.financialdatasets.ai/prices/'
    f'?ticker={ticker}'
    f'&interval={interval}'
    f'&interval_multiplier={interval_multiplier}'
    f'&start_date={start_date}'
    f'&end_date={end_date}'
)

# Make API request
response = requests.get(url, headers=headers)

# Parse prices from response
if response.status_code == 200:
    data = response.json()
    prices = data.get('prices', [])
    next_page_url = data.get('next_page_url')
else:
    print(f"Error: {response.status_code}, {response.text}")
```

**Response Structure**:
- `prices`: Array of price objects with OHLCV data
- `next_page_url`: URL to the next page of results (for pagination)

**Finding Available Tickers**:
To get a list of all available tickers:
```
GET https://api.financialdatasets.ai/prices/tickers/
```

## 9. Next Steps

1. Check if you need to update your API key in `.env` file
2. Test each existing API function with a sample ticker
3. Start implementing missing data functions
4. Integrate new data into agent decision-making
5. Enhance UI to display the new data 