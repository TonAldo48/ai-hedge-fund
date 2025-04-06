'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CandlestickChart, StockDataPoint } from '@/components/charts/candlestick-chart'
import { fetchPriceHistory, fetchStockDetails } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, ArrowUp, Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import React from 'react'
import { Slider } from '@/components/ui/slider'

type StockDetailPageProps = {
  params: {
    symbol: string
  }
}

// Mock AI insights
const aiInsights = [
  {
    analyst: 'Warren Buffett',
    signal: 'BUY',
    confidence: 0.85,
    reasoning: 'Strong moat with excellent brand recognition. Consistent cash flow generation and robust balance sheet. Attractive valuation relative to long-term growth potential. Company has demonstrated ability to innovate and adapt to changing market conditions.',
    pros: ['Strong brand', 'Consistent cash flow', 'Healthy balance sheet', 'Innovation leadership'],
    cons: ['Market saturation in key segments', 'Increasing competition', 'Regulatory scrutiny'],
  },
  {
    analyst: 'Charlie Munger',
    signal: 'BUY',
    confidence: 0.80,
    reasoning: 'Outstanding business model with high returns on capital. Management demonstrates strong capital allocation skills. Competitive advantages appear durable and substantial. Price represents reasonable value for a business of this quality.',
    pros: ['Quality business model', 'Skilled management', 'Durable competitive advantage'],
    cons: ['Premium valuation requires sustained execution', 'Cyclical headwinds possible'],
  },
  {
    analyst: 'Cathie Wood',
    signal: 'HOLD',
    confidence: 0.65,
    reasoning: 'Innovation pace has slowed, but still maintains leadership in key technologies. Current product cycle appears to be in middle stages. Future growth opportunities exist but face increased competition from emerging disruptors.',
    pros: ['Technology leadership', 'Strong ecosystem', 'Large R&D investments'],
    cons: ['Innovation pace slowing', 'Disruptive threats', 'Mature product cycle'],
  },
]

// Update the interface used in fetchPriceHistory to include OHLC data
interface StockHistoryPoint {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export default function StockDetailPage({ params }: StockDetailPageProps) {
  // Access symbol from params using React.use() for Next.js 15 compatibility
  const unwrappedParams = React.use(params as any) as { symbol: string }
  const symbol = unwrappedParams.symbol
  const [stockData, setStockData] = useState<StockDataPoint[]>([])
  const [stockDetails, setStockDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1m'|'3m'|'6m'|'1y'|'5y'>('3m')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 100])

  // Load stock details (price, name, etc)
  useEffect(() => {
    async function loadStockDetails() {
      setDetailsLoading(true)
      try {
        const data = await fetchStockDetails(symbol)
        setStockDetails(data)
      } catch (error) {
        console.error('Error loading stock details:', error)
      } finally {
        setDetailsLoading(false)
      }
    }

    loadStockDetails()
  }, [symbol])

  // Get stock info from API data or fallback to mock
  const stockInfo = stockDetails ? {
    symbol,
    name: stockDetails.name || getStockName(symbol),
    price: stockDetails.price,
    change: stockDetails.change,
    changePercent: stockDetails.changePercent,
    volume: stockDetails.volume,
    marketCap: formatMarketCap(stockDetails.marketCap),
    pe: stockDetails.pe,
    eps: stockDetails.pe && stockDetails.price ? (stockDetails.price / stockDetails.pe).toFixed(2) : null,
    dividend: stockDetails.dividend,
    dividendYield: stockDetails.yield,
  } : {
    symbol,
    name: getStockName(symbol),
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 'N/A',
    pe: 0,
    eps: 0,
    dividend: 0,
    dividendYield: 0,
  }

  // Technical indicators
  const technicalIndicators = [
    { name: 'RSI (14)', value: 58.4, interpretation: 'Neutral' },
    { name: 'MACD', value: 2.36, interpretation: 'Bullish' },
    { name: 'Moving Avg (50)', value: 172.45, interpretation: 'Bullish' },
    { name: 'Moving Avg (200)', value: 168.32, interpretation: 'Bullish' },
    { name: 'Bollinger Bands', value: 'Middle', interpretation: 'Neutral' },
    { name: 'Stochastic Oscillator', value: 65.2, interpretation: 'Neutral' },
  ]

  // Fund ownership data
  const institutionalOwnership = [
    { fund: 'Vanguard Group', shares: 1_342_567_890, percentOwned: 7.5 },
    { fund: 'BlackRock', shares: 1_123_456_789, percentOwned: 6.3 },
    { fund: 'State Street', shares: 687_432_123, percentOwned: 3.8 },
    { fund: 'Fidelity', shares: 532_145_678, percentOwned: 3.0 },
    { fund: 'Berkshire Hathaway', shares: 468_329_012, percentOwned: 2.6 },
  ]

  // Load price history data
  useEffect(() => {
    async function loadStockData() {
      setLoading(true)
      try {
        // Map local timeframe format to API timeframe format
        const apiTimeframeMap: Record<string, '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'> = {
          '1m': '1M',
          '3m': '3M', 
          '6m': '3M', // API doesn't have 6M, fallback to 3M
          '1y': '1Y',
          '5y': '5Y'
        }
        
        const apiTimeframe = apiTimeframeMap[timeframe]
        const data = await fetchPriceHistory(symbol, apiTimeframe) as StockHistoryPoint[]
        
        // Check if data is a valid array
        if (!Array.isArray(data)) {
          console.error('Invalid data format received:', data)
          return
        }
        
        // Transform price history data to StockDataPoint format
        const chartData: StockDataPoint[] = data.map((point: StockHistoryPoint) => ({
          date: point.date,
          // If we have full OHLC data, use it
          open: point.open || point.price * 0.998,  // Use provided open or estimate from price
          high: point.high || point.price * 1.005,  // Use provided high or estimate from price
          low: point.low || point.price * 0.995,    // Use provided low or estimate from price
          close: point.price, // Use price as close
          volume: point.volume || Math.round(point.price * 1000)  // Use provided volume or mock volume
        }))
        
        setStockData(chartData)
        // Reset zoom when changing timeframe
        setZoomLevel(100)
        setVisibleRange([0, 100])
      } catch (error) {
        console.error('Error loading stock data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStockData()
  }, [symbol, timeframe])

  // Calculate visible data based on zoom level
  const visibleData = React.useMemo(() => {
    if (!stockData.length) return []
    
    const start = Math.floor(stockData.length * (visibleRange[0] / 100))
    const end = Math.ceil(stockData.length * (visibleRange[1] / 100))
    
    return stockData.slice(start, end)
  }, [stockData, visibleRange])

  // Handle zoom in/out
  const handleZoomIn = () => {
    if (zoomLevel <= 25) return
    const newZoomLevel = Math.max(25, zoomLevel - 25)
    const visibleWidth = newZoomLevel
    const currentCenter = (visibleRange[0] + visibleRange[1]) / 2
    
    const newStart = Math.max(0, currentCenter - visibleWidth / 2)
    const newEnd = Math.min(100, newStart + visibleWidth)
    
    setZoomLevel(newZoomLevel)
    setVisibleRange([newStart, newEnd])
  }

  const handleZoomOut = () => {
    if (zoomLevel >= 100) {
      setZoomLevel(100)
      setVisibleRange([0, 100])
      return
    }
    
    const newZoomLevel = Math.min(100, zoomLevel + 25)
    const visibleWidth = newZoomLevel
    const currentCenter = (visibleRange[0] + visibleRange[1]) / 2
    
    const newStart = Math.max(0, currentCenter - visibleWidth / 2)
    const newEnd = Math.min(100, newStart + visibleWidth)
    
    setZoomLevel(newZoomLevel)
    setVisibleRange([newStart, newEnd])
  }

  // Handle slider change
  const handleRangeChange = (value: number[]) => {
    if (value.length === 1) {
      // If we only get one value, use it as the center of our visible range
      const center = value[0]
      const halfWidth = zoomLevel / 2
      setVisibleRange([
        Math.max(0, center - halfWidth),
        Math.min(100, center + halfWidth)
      ])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{symbol}</h2>
          <p className="text-muted-foreground">{stockInfo.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            {detailsLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${stockInfo.price?.toFixed(2) || 'N/A'}</div>
                <div className={`text-sm ${stockInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change?.toFixed(2) || 'N/A'} ({stockInfo.changePercent?.toFixed(2) || 'N/A'}%)
                </div>
              </>
            )}
          </div>
          <Button>Add to Portfolio</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Price Chart</CardTitle>
            <CardDescription>Historical price data for {symbol}</CardDescription>
          </div>
          <div className="flex gap-1">
            {(['1m', '3m', '6m', '1y', '5y'] as const).map(period => (
              <Button 
                key={period} 
                variant={timeframe === period ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-[500px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading chart data...</span>
            </div>
          ) : (
            <>
              <div className="h-[500px]">
                <CandlestickChart data={visibleData.length ? visibleData : stockData} />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomIn}
                  disabled={zoomLevel <= 25}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <Slider
                    defaultValue={[50]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleRangeChange}
                    disabled={zoomLevel >= 100}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomOut}
                  disabled={zoomLevel >= 100}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fundamentals">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="technicals">Technicals</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
            </TabsList>
            <TabsContent value="fundamentals" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
                  <div className="font-medium">{stockInfo.marketCap}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
                  <div className="font-medium">{stockInfo.pe || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">EPS</div>
                  <div className="font-medium">${stockInfo.eps || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Dividend Yield</div>
                  <div className="font-medium">{stockInfo.dividendYield ? `${stockInfo.dividendYield}%` : 'N/A'}</div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Industry Avg</TableHead>
                    <TableHead>Comparison</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Revenue Growth (YoY)</TableCell>
                    <TableCell>8.2%</TableCell>
                    <TableCell>6.5%</TableCell>
                    <TableCell className="text-green-500">Above Average</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Profit Margin</TableCell>
                    <TableCell>22.3%</TableCell>
                    <TableCell>18.7%</TableCell>
                    <TableCell className="text-green-500">Above Average</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Return on Equity</TableCell>
                    <TableCell>38.4%</TableCell>
                    <TableCell>28.9%</TableCell>
                    <TableCell className="text-green-500">Above Average</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Debt to Equity</TableCell>
                    <TableCell>1.28</TableCell>
                    <TableCell>1.35</TableCell>
                    <TableCell className="text-green-500">Lower Risk</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Current Ratio</TableCell>
                    <TableCell>1.82</TableCell>
                    <TableCell>1.62</TableCell>
                    <TableCell className="text-green-500">Better Liquidity</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="technicals" className="pt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Technical Indicators</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Indicator</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Signal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technicalIndicators.map(indicator => (
                        <TableRow key={indicator.name}>
                          <TableCell>{indicator.name}</TableCell>
                          <TableCell>{indicator.value}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                indicator.interpretation === 'Bullish' ? 'default' : 
                                indicator.interpretation === 'Bearish' ? 'destructive' : 
                                'outline'
                              }
                            >
                              {indicator.interpretation}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="mb-4 text-lg font-medium">Support & Resistance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm">Strong Resistance</span>
                        <span className="font-medium">$194.50</span>
                      </div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm">Resistance</span>
                        <span className="font-medium">$185.20</span>
                      </div>
                      <div className="my-2 flex items-center">
                        <div className="h-0.5 flex-1 bg-muted"></div>
                        <span className="mx-2 font-medium">${stockInfo.price?.toFixed(2) || 'N/A'}</span>
                        <div className="h-0.5 flex-1 bg-muted"></div>
                      </div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm">Support</span>
                        <span className="font-medium">$172.80</span>
                      </div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm">Strong Support</span>
                        <span className="font-medium">$165.30</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Volume Analysis</h4>
                      <p className="text-sm">
                        Recent trading volume ({(stockInfo.volume / 1000000).toFixed(1)}M) is 18% higher than the 
                        30-day average, indicating increased interest in the stock.
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Pattern Recognition</h4>
                      <p className="text-sm">
                        Recent price action shows a potential bull flag pattern forming, 
                        which could indicate continued upward momentum if the pattern completes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ai-insights" className="pt-4">
              <div className="space-y-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-medium">{insight.analyst}</h3>
                      <Badge variant={insight.signal === 'BUY' ? 'default' : insight.signal === 'SELL' ? 'destructive' : 'outline'}>
                        {insight.signal} ({(insight.confidence * 100).toFixed(0)}% Confidence)
                      </Badge>
                    </div>
                    <p className="mb-4 text-sm">{insight.reasoning}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Strengths</h4>
                        <ul className="space-y-1">
                          {insight.pros.map((pro, i) => (
                            <li key={i} className="flex items-center text-sm text-green-500">
                              <ArrowUp className="mr-1 h-4 w-4" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Weaknesses</h4>
                        <ul className="space-y-1">
                          {insight.cons.map((con, i) => (
                            <li key={i} className="flex items-center text-sm text-red-500">
                              <ArrowDown className="mr-1 h-4 w-4" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="ownership" className="pt-4">
              <h3 className="mb-4 text-lg font-medium">Top Institutional Holders</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">% Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutionalOwnership.map((institution) => (
                    <TableRow key={institution.fund}>
                      <TableCell>{institution.fund}</TableCell>
                      <TableCell className="text-right">{(institution.shares / 1000000).toFixed(1)}M</TableCell>
                      <TableCell className="text-right">{institution.percentOwned.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-medium">Ownership Breakdown</h3>
                <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                  <div className="flex h-full">
                    <div className="h-full w-[65%] bg-blue-500"></div>
                    <div className="h-full w-[20%] bg-green-500"></div>
                    <div className="h-full w-[15%] bg-amber-500"></div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <div className="flex items-center">
                    <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                    <span>Institutional (65%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-1 h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Insider (20%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-1 h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>Retail (15%)</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla, Inc.',
    'META': 'Meta Platforms, Inc.',
    'NFLX': 'Netflix, Inc.',
  }
  
  return stockNames[symbol] || symbol
}

function formatMarketCap(marketCap: number): string {
  if (!marketCap) return 'N/A'
  
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toLocaleString()}`
  }
} 