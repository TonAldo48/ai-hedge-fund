'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data - in a real app, this would come from an API
const stocksData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 187.32, change: 1.24, changePercent: 0.67 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 417.88, change: -2.36, changePercent: -0.56 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 176.44, change: 5.78, changePercent: 3.39 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.12, change: 0.56, changePercent: 0.32 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 879.90, change: 32.15, changePercent: 3.79 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 172.63, change: -8.54, changePercent: -4.72 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 474.99, change: 12.87, changePercent: 2.78 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', price: 632.41, change: -3.45, changePercent: -0.54 },
]

export default function StocksPage() {
  const [search, setSearch] = useState('')
  
  const filteredStocks = stocksData.filter((stock) =>
    stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
    stock.name.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stocks</h2>
        <p className="text-muted-foreground">
          Browse and analyze stocks for your trading strategy
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button>
          Add to Watchlist
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>
            Latest prices and performance of popular stocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">% Change</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/stocks/${stock.symbol}`}>
                        View
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 