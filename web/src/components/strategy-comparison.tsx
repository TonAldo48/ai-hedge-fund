'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from 'recharts'
import { SimulationResult, TradeDecision, AnalystSignal } from '@/lib/api'
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface StrategyComparisonProps {
  results: Array<{
    id: string
    name: string
    result: SimulationResult
  }>
  onRemoveStrategy: (id: string) => void
}

export function StrategyComparison({ results, onRemoveStrategy }: StrategyComparisonProps) {
  const [tab, setTab] = useState('performance')

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
          <CardDescription>
            Add multiple strategies to compare their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No strategies to compare</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Run simulations with different configurations to add them for comparison
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Combine portfolio history data for chart
  const combinedChartData = combinePortfolioHistory(results)

  // Sort results by total return (highest first)
  const sortedResults = [...results].sort((a, b) => 
    b.result.performance.totalReturn - a.result.performance.totalReturn
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison</CardTitle>
        <CardDescription>
          Compare performance metrics across different strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="chart">Performance Chart</TabsTrigger>
            <TabsTrigger value="trades">Trading Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Strategy</TableHead>
                  <TableHead className="text-right">Total Return</TableHead>
                  <TableHead className="text-right">Annualized Return</TableHead>
                  <TableHead className="text-right">Max Drawdown</TableHead>
                  <TableHead className="text-right">Sharpe Ratio</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name}
                      {index === 0 && (
                        <Badge variant="default" className="ml-2">Best</Badge>
                      )}
                    </TableCell>
                    <TableCell className={`text-right ${item.result.performance.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.result.performance.totalReturn >= 0 ? '+' : ''}
                      {item.result.performance.totalReturn.toFixed(2)}%
                    </TableCell>
                    <TableCell className={`text-right ${item.result.performance.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.result.performance.annualizedReturn >= 0 ? '+' : ''}
                      {item.result.performance.annualizedReturn.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      -{item.result.performance.maxDrawdown.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.result.performance.sharpeRatio.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveStrategy(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="chart">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${Number(value).toLocaleString()}`, 'Value']}
                    labelFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <Legend />
                  {results.map((item, index) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.id}
                      name={item.name}
                      stroke={getLineColor(index)}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trades">
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-md bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {results.map((item) => {
                    const trades = item.result.tradeDecisions;
                    const buyCount = trades.filter(t => t.action === 'BUY').length;
                    const sellCount = trades.filter(t => t.action === 'SELL').length;
                    return (
                      <div key={item.id} className="text-center">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <div className="mt-1 text-2xl font-bold">{trades.length}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <span className="text-green-500">{buyCount} buys</span> / <span className="text-red-500">{sellCount} sells</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Strategy Insights</h3>
                <div className="space-y-3">
                  {sortedResults.map((item) => {
                    const trades = item.result.tradeDecisions;
                    const signals = item.result.analystSignals;
                    const bestTicker = findBestTicker(trades);
                    
                    return (
                      <div key={item.id} className="rounded-md border p-4">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium">Most Active Tickers</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {getMostActiveTickers(trades).map(ticker => (
                                <Badge key={ticker} variant="outline">{ticker}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Best Performing Asset</div>
                            {bestTicker ? (
                              <div className="mt-1 flex items-center text-green-500">
                                <ArrowUp className="mr-1 h-4 w-4" />
                                <span>{bestTicker}</span>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">No data available</div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">Most Influential Analyst</div>
                            <div className="mt-1 text-sm">
                              {getMostInfluentialAnalyst(signals) || 'No data available'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Trading Style</div>
                            <div className="mt-1 text-sm">
                              {getTradingStyle(trades, item.result.portfolioHistory?.length || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper functions
function combinePortfolioHistory(results: Array<{id: string, name: string, result: SimulationResult}>) {
  const combinedData: Record<string, any>[] = [];
  
  results.forEach(item => {
    if (!item.result.portfolioHistory) return;
    
    item.result.portfolioHistory.forEach((point, i) => {
      if (!combinedData[i]) {
        combinedData[i] = { date: point.date };
      }
      combinedData[i][item.id] = point.value;
    });
  });
  
  return combinedData;
}

function getLineColor(index: number) {
  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
    '#FF6B6B', '#54C5EB', '#8BC34A', '#F44336', '#9C27B0'
  ];
  return colors[index % colors.length];
}

function getMostActiveTickers(trades: TradeDecision[]) {
  // Count trade frequency by ticker
  const tickerCounts = trades.reduce((acc, trade) => {
    acc[trade.ticker] = (acc[trade.ticker] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort and get top 3
  return Object.entries(tickerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ticker]) => ticker);
}

function findBestTicker(trades: TradeDecision[]) {
  // Very simplified approach - in a real app, you'd calculate profit/loss per ticker
  const tickers = Array.from(new Set(trades.map(t => t.ticker)));
  return tickers.length > 0 ? tickers[0] : null;
}

function getMostInfluentialAnalyst(signals: AnalystSignal[]) {
  if (signals.length === 0) return null;
  
  // Count frequencies
  const analystCounts = signals.reduce((acc, signal) => {
    acc[signal.analyst] = (acc[signal.analyst] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find the most frequent
  return Object.entries(analystCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([analyst]) => analyst)[0];
}

function getTradingStyle(trades: TradeDecision[], totalDays: number) {
  if (trades.length === 0 || totalDays === 0) return 'Unknown';
  
  const tradesPerDay = trades.length / totalDays;
  
  if (tradesPerDay < 0.05) return 'Very Long-Term';
  if (tradesPerDay < 0.1) return 'Long-Term';
  if (tradesPerDay < 0.3) return 'Medium-Term';
  if (tradesPerDay < 0.7) return 'Short-Term';
  return 'Day Trading';
} 