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
  const [customStocks, setCustomStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStockSymbol, setNewStockSymbol] = useState('')
  const [addingStock, setAddingStock] = useState(false)
  const [addStockError, setAddStockError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
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
    // End loading state once initial load is complete
    setLoading(false)
  }, [])
  
  // Save custom stocks to local storage when they change
  useEffect(() => {
    if (customStocks.length > 0) {
      localStorage.setItem('stockWatchlist', JSON.stringify(customStocks))
    } else if (customStocks.length === 0 && localStorage.getItem('stockWatchlist')) {
      // Clean up localStorage if watchlist is empty
      localStorage.removeItem('stockWatchlist')
    }
  }, [customStocks])

  // Add a custom stock to the watchlist
  const addCustomStock = async () => {
    if (!newStockSymbol) {
      setAddStockError('Please enter a stock symbol')
      return
    }
    
    // Clean the symbol - remove $ and spaces
    const cleanSymbol = newStockSymbol.replace(/[$\s]/g, '').toUpperCase();
    
    // Check if stock already exists in the watchlist
    if (customStocks.some(stock => stock.symbol.toUpperCase() === cleanSymbol)) {
      setAddStockError('This stock is already in your watchlist')
      return
    }
    
    setAddingStock(true)
    setAddStockError(null)
    
    try {
      // Fetch the stock data from the API
      console.log(`Fetching stock data for ${cleanSymbol} from API`)
      const response = await fetch(`/api/stocks/${cleanSymbol}`)
      
      if (response.ok) {
        const stockData = await response.json()
        
        // Add the custom flag
        stockData.isCustom = true
        
        // Add to custom stocks
        setCustomStocks(prev => [...prev, stockData])
        
        // Reset form
        setNewStockSymbol('')
        setDialogOpen(false)
        
        // Update the last updated timestamp
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        // Try Financial Datasets API directly as a fallback
        console.log(`API call failed with status ${response.status}, trying Financial Datasets API directly`)
        try {
          const financialResponse = await fetch(`/api/financial-data/quote/${cleanSymbol}`)
          
          if (financialResponse.ok) {
            const financialData = await financialResponse.json()
            // Format the data to match our expected Stock format
            const stockData: Stock = {
              symbol: cleanSymbol,
              name: financialData.name || `${cleanSymbol} Stock`,
              price: financialData.price || financialData.close || 0,
              change: financialData.change || 0,
              changePercent: financialData.changePercent || 0,
              isCustom: true
            }
            setCustomStocks(prev => [...prev, stockData])
            setNewStockSymbol('')
            setDialogOpen(false)
            setLastUpdated(new Date().toLocaleTimeString())
          } else {
            // Get error details from the response
            const errorData = await financialResponse.json().catch(() => ({}))
            console.error(`Financial API call failed: ${JSON.stringify(errorData)}`)
            
            throw new Error(
              errorData.error || 
              `Could not find stock with symbol "${cleanSymbol}". Please verify the symbol is correct.`
            )
          }
        } catch (fallbackError) {
          console.error('Fallback API error:', fallbackError)
          
          // Get error details from the original response
          const errorData = await response.json().catch(() => ({}))
          
          throw new Error(
            errorData.error || 
            (fallbackError instanceof Error ? fallbackError.message : 
            `Could not find stock with symbol "${cleanSymbol}". Please verify the symbol is correct.`)
          )
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
  
  // Filter stocks based on search query
  const filteredStocks = customStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
    stock.name.toLowerCase().includes(search.toLowerCase())
  )
  
  // Refresh stock data for watchlist items
  const refreshWatchlist = async () => {
    if (customStocks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a copy of the current custom stocks
      const updatedStocks = [...customStocks];
      
      // Update each stock with fresh data
      for (let i = 0; i < updatedStocks.length; i++) {
        const stock = updatedStocks[i];
        try {
          const response = await fetch(`/api/stocks/${stock.symbol}`);
          if (response.ok) {
            const latestData = await response.json();
            updatedStocks[i] = {
              ...latestData,
              isCustom: true
            };
          }
        } catch (err) {
          console.error(`Error updating ${stock.symbol}:`, err);
          // Keep the existing stock data if we fail to fetch new data
        }
      }
      
      // Update the watchlist with refreshed data
      setCustomStocks(updatedStocks);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error refreshing watchlist:', err);
      setError('Failed to refresh watchlist data.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Watchlist</h2>
        <p className="text-muted-foreground">
          Manage and track your favorite stocks
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your watchlist..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {customStocks.length > 0 && (
          <Button onClick={refreshWatchlist} disabled={loading} variant="outline">
            {loading ? <span className="animate-spin mr-2">↻</span> : '↻'}
            Refresh
          </Button>
        )}
        
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
                  onChange={(e) => {
                    // Clean input as user types (remove $ signs)
                    const cleanedInput = e.target.value.replace(/[$\s]/g, '').toUpperCase();
                    setNewStockSymbol(cleanedInput);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Enter stock symbols without $ prefix (e.g. AAPL, MSFT, GOOGL)
                </p>
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
              <CardTitle>My Stocks</CardTitle>
              <CardDescription>
                Stocks you're interested in
                {lastUpdated && ` · Updated: ${lastUpdated}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : customStocks.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto bg-muted rounded-full w-16 h-16 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">Your watchlist is empty</h3>
              <p className="text-muted-foreground">
                Start by adding stocks that interest you to your watchlist
              </p>
              <Button onClick={() => setDialogOpen(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Stock
              </Button>
            </div>
          ) : (
            <>
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
                    Array.from({ length: customStocks.length || 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">
                          {stock.symbol}
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeCustomStock(stock.symbol)} 
                            className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900 focus:bg-red-100 dark:focus:bg-red-900 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
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
                        No stocks found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {filteredStocks.some(stock => stock.price === 0) && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Note: Some stocks may display "No data" if real-time market data is unavailable from our data providers.</p>
                </div>
              )}
              
              {customStocks.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your watchlist?')) {
                        setCustomStocks([]);
                      }
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Clear Watchlist
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 