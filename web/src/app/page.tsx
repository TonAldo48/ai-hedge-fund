'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SimulationForm from '@/components/simulation-form';
import TradeDecisionsTable from '@/components/trade-decisions-table';
import AnalystSignalsTable from '@/components/analyst-signals-table';
import PerformanceMetrics from '@/components/performance-metrics';
import { SimulationConfig, SimulationResult, runMockSimulation } from '@/lib/api';

export default function Home() {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSimulation = async (config: SimulationConfig) => {
    setIsLoading(true);
    try {
      // Use mock simulation for now until backend is ready
      const result = await runMockSimulation(config);
      setSimulationResult(result);
    } catch (error) {
      console.error('Error running simulation:', error);
      // TODO: Add error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Hedge Fund Simulation</CardTitle>
          <CardDescription>
            Configure and run your AI-powered trading simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimulationForm onSubmit={handleRunSimulation} isLoading={isLoading} />
        </CardContent>
      </Card>

      {simulationResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance metrics for your trading strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics performance={simulationResult.performance} />
            </CardContent>
          </Card>

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
    </div>
  );
}
