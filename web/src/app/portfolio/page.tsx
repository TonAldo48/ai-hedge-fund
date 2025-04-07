'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortfolioChart } from '@/components/charts/portfolio-chart'
import { AllocationChart } from '@/components/charts/allocation-chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { fetchPortfolioData, PortfolioData } from '@/lib/api'

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        setLoading(true)
        const data = await fetchPortfolioData()
        setPortfolioData(data)
        setError(null)
      } catch (err) {
        console.error('Error loading portfolio data:', err)
        setError('Failed to load portfolio data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadPortfolioData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolioData) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium">Could not load portfolio data</h3>
          <p className="text-sm text-muted-foreground">{error || 'An unknown error occurred'}</p>
        </div>
      </div>
    )
  }

  const { 
    totalValue, 
    cashBalance, 
    totalGain, 
    buyingPower, 
    holdings, 
    transactions, 
    portfolioHistory 
  } = portfolioData

  // Calculate weight for each holding
  const holdingsWithWeight = holdings.map(holding => ({
    ...holding,
    weight: (holding.value / totalValue) * 100
  }))

  const allocationData = holdingsWithWeight.map(h => ({
    name: h.name,
    symbol: h.symbol,
    value: h.value
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
        <p className="text-muted-foreground">
          Manage and track your simulated investment portfolio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cashBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${buyingPower.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Historical value of your portfolio over time</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart data={portfolioHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>How your portfolio is distributed across assets</CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocationData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="holdings">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            <TabsContent value="holdings" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg. Cost</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdingsWithWeight.map((holding) => (
                    <TableRow key={holding.symbol}>
                      <TableCell className="font-medium">{holding.symbol}</TableCell>
                      <TableCell>{holding.name}</TableCell>
                      <TableCell className="text-right">{holding.shares}</TableCell>
                      <TableCell className="text-right">${holding.averageCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${holding.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{holding.weight.toFixed(1)}%</TableCell>
                      <TableCell className={`text-right ${holding.totalGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {holding.totalGainPercent >= 0 ? '+' : ''}{holding.totalGainPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="transactions" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.symbol}</TableCell>
                      <TableCell>
                        <span className={transaction.action === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                          {transaction.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{transaction.shares}</TableCell>
                      <TableCell className="text-right">${transaction.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                      <TableCell>{transaction.agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 