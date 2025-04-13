'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { fetchAnalystInsights, fetchStockDetails, StockData, AnalystInsight } from '@/lib/api'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface StockAnalysisCardProps {
  symbol: string
}

export default function StockAnalysisCard({ symbol }: StockAnalysisCardProps) {
  const [stockDetails, setStockDetails] = useState<StockData | null>(null)
  const [insights, setInsights] = useState<AnalystInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch stock details
        const details = await fetchStockDetails(symbol)
        setStockDetails(details)
        
        // Fetch analyst insights
        const insightData = await fetchAnalystInsights(symbol)
        setInsights(insightData)
      } catch (err) {
        console.error('Error fetching stock analysis data:', err)
        setError('Failed to load stock analysis data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [symbol])

  // Mock technical indicators data - would ideally come from API
  const technicalIndicators = [
    { name: 'RSI (14)', value: 58.4, interpretation: 'Neutral' },
    { name: 'MACD', value: 2.36, interpretation: 'Bullish' },
    { name: 'Moving Avg (50)', value: 172.45, interpretation: 'Bullish' },
    { name: 'Moving Avg (200)', value: 168.32, interpretation: 'Bullish' },
    { name: 'Bollinger Bands', value: 'Middle', interpretation: 'Neutral' },
    { name: 'Stochastic Oscillator', value: 65.2, interpretation: 'Neutral' },
  ]

  // Mock institutional ownership data - would ideally come from API
  const institutionalOwnership = [
    { fund: 'Vanguard Group', shares: 1342600000, percentOwned: 7.5 },
    { fund: 'BlackRock', shares: 1123500000, percentOwned: 6.3 },
    { fund: 'State Street', shares: 687400000, percentOwned: 3.8 },
    { fund: 'Fidelity', shares: 532100000, percentOwned: 3.0 },
    { fund: 'Berkshire Hathaway', shares: 468300000, percentOwned: 2.6 },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
        </CardHeader>
        <CardContent>Loading stock analysis data...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    )
  }

  // Format large numbers for readability
  const formatNumberShort = (num: number) => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}T`
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  // Format shares count with commas
  const formatShares = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
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

          {/* Fundamentals Tab */}
          <TabsContent value="fundamentals" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
                <div className="font-medium">{stockDetails?.marketCap ? formatNumberShort(stockDetails.marketCap) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
                <div className="font-medium">{stockDetails?.pe || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">EPS</div>
                <div className="font-medium">${stockDetails?.pe && stockDetails?.price ? (stockDetails.price / stockDetails.pe).toFixed(2) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Dividend Yield</div>
                <div className="font-medium">{stockDetails?.yield ? `${stockDetails.yield.toFixed(2)}%` : 'N/A'}</div>
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

          {/* Technicals Tab */}
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
                      <span className="mx-2 font-medium">${stockDetails?.price?.toFixed(2) || 'N/A'}</span>
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
                      Recent trading volume ({stockDetails?.volume ? (stockDetails.volume / 1000000).toFixed(1) : 'N/A'}M) is 18% higher than the 
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

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="pt-4">
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-medium">{insight.analyst}</h3>
                    <Badge variant={insight.rating === 'BUY' ? 'default' : insight.rating === 'SELL' ? 'destructive' : 'outline'}>
                      {insight.rating} {insight.targetPrice && `($${insight.targetPrice})`}
                    </Badge>
                  </div>
                  <p className="mb-4 text-sm">{insight.summary}</p>
                  
                  {/* Strengths & Weaknesses would ideally come from API */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Strengths</h4>
                      <ul className="space-y-1">
                        {insight.rating !== 'SELL' && (
                          <>
                            <li className="flex items-center text-sm text-green-500">
                              <ArrowUp className="mr-1 h-4 w-4" />
                              Strong brand
                            </li>
                            <li className="flex items-center text-sm text-green-500">
                              <ArrowUp className="mr-1 h-4 w-4" />
                              Consistent cash flow
                            </li>
                            <li className="flex items-center text-sm text-green-500">
                              <ArrowUp className="mr-1 h-4 w-4" />
                              Innovation leadership
                            </li>
                          </>
                        )}
                        {insight.rating === 'SELL' && (
                          <li className="text-sm">No significant strengths noted</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Weaknesses</h4>
                      <ul className="space-y-1">
                        {insight.rating !== 'BUY' && (
                          <>
                            <li className="flex items-center text-sm text-red-500">
                              <ArrowDown className="mr-1 h-4 w-4" />
                              Market saturation
                            </li>
                            <li className="flex items-center text-sm text-red-500">
                              <ArrowDown className="mr-1 h-4 w-4" />
                              Increasing competition
                            </li>
                          </>
                        )}
                        {insight.rating === 'BUY' && (
                          <li className="text-sm">No significant weaknesses noted</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership" className="pt-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Top Institutional Holders</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>% Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutionalOwnership.map(holder => (
                    <TableRow key={holder.fund}>
                      <TableCell>{holder.fund}</TableCell>
                      <TableCell>{formatShares(holder.shares)}</TableCell>
                      <TableCell>{holder.percentOwned}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <h3 className="text-lg font-medium">Ownership Breakdown</h3>
              <div className="flex h-4 w-full overflow-hidden rounded-full">
                <div className="bg-blue-500" style={{ width: '65%' }} title="Institutional (65%)"></div>
                <div className="bg-green-500" style={{ width: '20%' }} title="Insider (20%)"></div>
                <div className="bg-yellow-500" style={{ width: '15%' }} title="Retail (15%)"></div>
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div> Institutional (65%)
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-green-500"></div> Insider (20%)
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div> Retail (15%)
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 