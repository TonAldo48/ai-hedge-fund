'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpDown, Search, AlertCircle, Plus, Trash } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Define the stock type
interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap?: number
  volume?: number
  sector?: string
  isCustom?: boolean
}

export default function StocksPage() {
  const [search, setSearch] = useState('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [customStocks, setCustomStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStockSymbol, setNewStockSymbol] = useState('')
  const [addingStock, setAddingStock] = useState(false)
  const [addStockError, setAddStockError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'watchlist'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Load custom stocks from local storage
  useEffect(() => {
    const storedWatchlist = localStorage.getItem('stockWatchlist')
    if (storedWatchlist) {
      try {
        const parsed = JSON.parse(storedWatchlist)
        if (Array.isArray(parsed)) {
          setCustomStocks(parsed)
        }
      } catch (err) {
        console.error('Error parsing watchlist from local storage:', err)
      }
    }
  }, [])
  
  // Save custom stocks to local storage when they change
  useEffect(() => {
    if (customStocks.length > 0) {
      localStorage.setItem('stockWatchlist', JSON.stringify(customStocks))
    }
  }, [customStocks])
  
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stocks')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch stocks: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No stock data available')
        }
        
        setStocks(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching stocks:', err)
        setStocks([])
        setError(err instanceof Error ? err.message : 'Failed to load stocks data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStocks()
  }, [])

  // Add a custom stock to the watchlist
  const addCustomStock = async () => {
    if (!newStockSymbol) {
      setAddStockError('Please enter a stock symbol')
      return
    }
    
    // Check if stock already exists in the watchlist
    if (customStocks.some(stock => stock.symbol.toUpperCase() === newStockSymbol.toUpperCase())) {
      setAddStockError('This stock is already in your watchlist')
      return
    }
    
    setAddingStock(true)
    setAddStockError(null)
    
    try {
      // Fetch the stock data from the API
      const response = await fetch(`/api/stocks/${newStockSymbol.toUpperCase()}`)
      
      if (response.ok) {
        const stockData = await response.json()
        
        // Add the custom flag
        stockData.isCustom = true
        
        // Add to custom stocks
        setCustomStocks(prev => [...prev, stockData])
        
        // Reset form
        setNewStockSymbol('')
        setDialogOpen(false)
      } else {
        // API couldn't find the stock, let's handle some common stocks manually
        const knownStocks: Record<string, { name: string }> = {
          'ABNB': { name: 'Airbnb, Inc.' },
          'UBER': { name: 'Uber Technologies, Inc.' },
          'LYFT': { name: 'Lyft, Inc.' },
          'RBLX': { name: 'Roblox Corporation' },
          'COIN': { name: 'Coinbase Global, Inc.' },
          'PLTR': { name: 'Palantir Technologies Inc.' },
          'SNOW': { name: 'Snowflake Inc.' },
          'DASH': { name: 'DoorDash, Inc.' },
          'ZM': { name: 'Zoom Video Communications, Inc.' },
          'SHOP': { name: 'Shopify Inc.' },
          'SNAP': { name: 'Snap Inc.' },
          'PINS': { name: 'Pinterest, Inc.' },
          'ROKU': { name: 'Roku, Inc.' },
          'SQ': { name: 'Block, Inc.' },
          'PYPL': { name: 'PayPal Holdings, Inc.' },
          'PTON': { name: 'Peloton Interactive, Inc.' },
          'HOOD': { name: 'Robinhood Markets, Inc.' },
          'DOCN': { name: 'DigitalOcean Holdings, Inc.' },
          'AI': { name: 'C3.ai, Inc.' },
          'U': { name: 'Unity Software Inc.' }
        };
        
        const symbol = newStockSymbol.toUpperCase();
        if (knownStocks[symbol]) {
          // Create a basic stock object for this known stock
          const stockData: Stock = {
            symbol: symbol,
            name: knownStocks[symbol].name,
            price: 0,
            change: 0,
            changePercent: 0,
            isCustom: true
          };
          
          setCustomStocks(prev => [...prev, stockData]);
          setNewStockSymbol('');
          setDialogOpen(false);
        } else {
          throw new Error(`Could not find stock with symbol "${newStockSymbol}"`);
        }
      }
    } catch (err) {
      console.error('Error adding custom stock:', err)
      setAddStockError(err instanceof Error ? err.message : 'Failed to add stock. Please try again.')
    } finally {
      setAddingStock(false)
    }
  }

  // Remove a custom stock from the watchlist
  const removeCustomStock = (symbol: string) => {
    setCustomStocks(prev => prev.filter(stock => stock.symbol !== symbol))
  }
  
  // Combine default and custom stocks
  const allStocks = [...stocks, ...customStocks]
  
  // Filter based on active tab and search query
  const displayedStocks = activeTab === 'all'
    ? allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase())
      )
    : customStocks.filter(stock => 
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
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Stock to Watchlist</DialogTitle>
              <DialogDescription>
                Enter a stock symbol to add it to your watchlist.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {addStockError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{addStockError}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL, MSFT, GOOGL"
                  value={newStockSymbol}
                  onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCustomStock} disabled={addingStock}>
                {addingStock ? 'Adding...' : 'Add Stock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>
                Latest prices and performance of popular stocks
              </CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-[300px]" onValueChange={(value) => setActiveTab(value as 'all' | 'watchlist')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Stocks</TabsTrigger>
                <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
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
                {loading ? (
                  // Display skeletons while loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : displayedStocks.length > 0 ? (
                  displayedStocks.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{stock.symbol}</span>
                          {stock.isCustom && (
                            <Badge variant="outline" className="ml-2">Watchlist</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell className="text-right">
                        {stock.price > 0 ? `$${stock.price.toFixed(2)}` : "No data"}
                      </TableCell>
                      <TableCell className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change !== 0 ? `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}` : "No data"}
                      </TableCell>
                      <TableCell className={`text-right ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.changePercent !== 0 ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%` : "No data"}
                      </TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        {stock.isCustom && (
                          <Button variant="ghost" size="icon" onClick={() => removeCustomStock(stock.symbol)} className="h-8 w-8">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/stocks/${stock.symbol}`}>
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {activeTab === 'watchlist' && customStocks.length === 0 
                        ? 'Your watchlist is empty. Click "Add Stock" to add stocks to your watchlist.'
                        : 'No stocks found matching your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {displayedStocks.some(stock => stock.price === 0) && (
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Note: Some stocks may display "No data" if real-time market data is unavailable from our data providers.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 