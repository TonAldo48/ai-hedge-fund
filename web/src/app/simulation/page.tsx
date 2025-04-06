'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SimulationForm from '@/components/simulation-form'
import TradeDecisionsTable from '@/components/trade-decisions-table'
import AnalystSignalsTable from '@/components/analyst-signals-table'
import PerformanceMetrics from '@/components/performance-metrics'
import { PortfolioChart } from '@/components/charts/portfolio-chart'
import { SimulationConfig, SimulationResult, runMockSimulation } from '@/lib/api'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { SaveSimulationDialog } from '@/components/save-simulation-dialog'
import { StrategyComparison } from '@/components/strategy-comparison'
import { Button } from '@/components/ui/button'

type SavedStrategy = {
  id: string
  name: string
  result: SimulationResult
  config: SimulationConfig
}

export default function SimulationPage() {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig | null>(null)
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([])
  const [strategiesCount, setStrategiesCount] = useState(0) // For generating unique IDs

  const handleRunSimulation = async (config: SimulationConfig) => {
    setIsLoading(true)
    setError(null)
    setCurrentConfig(config)
    try {
      // Use mock simulation for now until backend is ready
      const result = await runMockSimulation(config)
      setSimulationResult(result)
    } catch (error) {
      console.error('Error running simulation:', error)
      setError('An error occurred while running the simulation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadConfig = (config: SimulationConfig) => {
    setCurrentConfig(config)
    // You might want to automatically run the simulation when loading
    // or just populate the form and let the user click "Run"
    handleRunSimulation(config)
  }

  const handleAddToComparison = () => {
    if (!simulationResult || !currentConfig) return

    const newStrategy: SavedStrategy = {
      id: `strategy-${strategiesCount + 1}`,
      name: currentConfig.ticker.split(',')[0] + ' Strategy',
      result: simulationResult,
      config: currentConfig
    }

    setSavedStrategies([...savedStrategies, newStrategy])
    setStrategiesCount(prev => prev + 1)
  }

  const handleRemoveStrategy = (id: string) => {
    setSavedStrategies(savedStrategies.filter(strategy => strategy.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Simulation</h2>
          <p className="text-muted-foreground">
            Configure and run your AI-powered trading simulations
          </p>
        </div>
        {currentConfig && <SaveSimulationDialog currentConfig={currentConfig} onLoadConfig={handleLoadConfig} />}
      </div>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Hedge Fund Simulation</CardTitle>
            <CardDescription>
              Configure and run your AI-powered trading simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimulationForm 
              onSubmit={handleRunSimulation} 
              isLoading={isLoading} 
              initialConfig={currentConfig || undefined}
            />
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {simulationResult && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Key performance metrics for your trading strategy
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={handleAddToComparison}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add to Comparison</span>
                </Button>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics performance={simulationResult.performance} />
              </CardContent>
            </Card>

            {simulationResult.portfolioHistory && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value</CardTitle>
                  <CardDescription>
                    Historical performance of your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PortfolioChart data={simulationResult.portfolioHistory} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="decisions">
                  <TabsList>
                    <TabsTrigger value="decisions">Trading Decisions</TabsTrigger>
                    <TabsTrigger value="signals">Analyst Signals</TabsTrigger>
                  </TabsList>
                  <TabsContent value="decisions">
                    <TradeDecisionsTable decisions={simulationResult.tradeDecisions} />
                  </TabsContent>
                  <TabsContent value="signals">
                    <AnalystSignalsTable signals={simulationResult.analystSignals} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Strategy Comparison Section */}
        <StrategyComparison 
          results={savedStrategies.map(s => ({ 
            id: s.id, 
            name: s.name, 
            result: s.result 
          }))}
          onRemoveStrategy={handleRemoveStrategy}
        />
      </div>
    </div>
  )
} 