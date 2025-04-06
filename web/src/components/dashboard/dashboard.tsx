'use client'

import Link from 'next/link'
import { ArrowRight, LineChart, TrendingUp, BarChart3, CandlestickChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  // Mock data - in a real app, this would come from an API
  const performanceData = {
    totalReturn: '+12.8%',
    annualizedReturn: '+9.2%',
    sharpeRatio: '1.38',
    maxDrawdown: '-8.4%',
  }

  const recentSimulations = [
    { id: 1, ticker: 'AAPL,MSFT,NVDA', date: '2023-04-01', return: '+8.2%' },
    { id: 2, ticker: 'TSLA,GOOGL', date: '2023-03-28', return: '-2.1%' },
    { id: 3, ticker: 'AMZN,META,NFLX', date: '2023-03-15', return: '+15.4%' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/simulation">
              New Simulation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.totalReturn}</div>
            <p className="text-xs text-muted-foreground">Across all simulations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.annualizedReturn}</div>
            <p className="text-xs text-muted-foreground">Average annual return</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <CandlestickChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.maxDrawdown}</div>
            <p className="text-xs text-muted-foreground">Largest decline from peak</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Simulations</CardTitle>
          <CardDescription>
            Your most recent trading simulations and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSimulations.map((simulation) => (
              <div key={simulation.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{simulation.ticker}</span>
                    <span className="text-sm text-muted-foreground">({simulation.date})</span>
                  </div>
                  <div className={`text-sm ${simulation.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {simulation.return}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/simulation/results/${simulation.id}`}>
                    <span>View Details</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/simulations/history">
              View All Simulations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 