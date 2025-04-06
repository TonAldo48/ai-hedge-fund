'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Mock agent data
const agents = [
  {
    id: 'ben_graham',
    name: 'Ben Graham',
    description: 'Value investing pioneer who focuses on margin of safety',
    enabled: true,
    weight: 10,
  },
  {
    id: 'bill_ackman',
    name: 'Bill Ackman',
    description: 'Activist investor who takes bold positions',
    enabled: true,
    weight: 10,
  },
  {
    id: 'cathie_wood',
    name: 'Cathie Wood',
    description: 'Growth investor focused on disruptive innovation',
    enabled: false,
    weight: 0,
  },
  {
    id: 'charlie_munger',
    name: 'Charlie Munger',
    description: 'Focused on wonderful businesses at fair prices',
    enabled: true,
    weight: 15,
  },
  {
    id: 'peter_lynch',
    name: 'Peter Lynch',
    description: 'Growth investor seeking "ten-baggers"',
    enabled: false,
    weight: 0,
  },
  {
    id: 'phil_fisher',
    name: 'Phil Fisher',
    description: 'Growth investor with scuttlebutt approach',
    enabled: false,
    weight: 0,
  },
  {
    id: 'stanley_druckenmiller',
    name: 'Stanley Druckenmiller',
    description: 'Macro investor seeking asymmetric opportunities',
    enabled: true,
    weight: 15,
  },
  {
    id: 'warren_buffett',
    name: 'Warren Buffett',
    description: 'Seeks wonderful companies at fair prices',
    enabled: true,
    weight: 20,
  },
  {
    id: 'valuation_agent',
    name: 'Valuation Agent',
    description: 'Calculates intrinsic value of stocks',
    enabled: true,
    weight: 10,
  },
  {
    id: 'sentiment_agent',
    name: 'Sentiment Agent',
    description: 'Analyzes market sentiment',
    enabled: false,
    weight: 0,
  },
  {
    id: 'fundamentals_agent',
    name: 'Fundamentals Agent',
    description: 'Analyzes fundamental data',
    enabled: true,
    weight: 10,
  },
  {
    id: 'technicals_agent',
    name: 'Technicals Agent',
    description: 'Analyzes technical indicators',
    enabled: true,
    weight: 10,
  },
]

export default function PredefinedAgentsPage() {
  const [agentSettings, setAgentSettings] = useState(agents)
  const [successMessage, setSuccessMessage] = useState("")
  
  const handleToggleAgent = (agentId: string) => {
    setAgentSettings(
      agentSettings.map((agent) =>
        agent.id === agentId
          ? { ...agent, enabled: !agent.enabled, weight: !agent.enabled ? 10 : 0 }
          : agent
      )
    )
  }
  
  const handleWeightChange = (agentId: string, weight: number) => {
    setAgentSettings(
      agentSettings.map((agent) =>
        agent.id === agentId ? { ...agent, weight } : agent
      )
    )
  }
  
  const totalWeight = agentSettings.reduce((sum, agent) => sum + (agent.enabled ? agent.weight : 0), 0)
  
  const handleSave = () => {
    // Save agent settings to localStorage (would save to API in production)
    localStorage.setItem('agentSettings', JSON.stringify(agentSettings))
    setSuccessMessage("Agent configuration saved successfully!")
    
    // Clear message after a delay
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Predefined Agents</h2>
          <p className="text-muted-foreground">
            Configure predefined AI agents for your trading strategy
          </p>
        </div>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md dark:bg-green-900/20 dark:text-green-400">
          {successMessage}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>AI Agents Configuration</CardTitle>
          <CardDescription>
            Select which AI agents to enable and adjust their weights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="investor-agents">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="investor-agents">Investor Agents</TabsTrigger>
              <TabsTrigger value="analysis-agents">Analysis Agents</TabsTrigger>
            </TabsList>
            <TabsContent value="investor-agents" className="space-y-4 pt-4">
              <div className="space-y-4">
                {agentSettings
                  .filter((agent) => !['valuation_agent', 'sentiment_agent', 'fundamentals_agent', 'technicals_agent'].includes(agent.id))
                  .map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                      <div className="flex flex-1 items-start space-x-3">
                        <Checkbox
                          id={agent.id}
                          checked={agent.enabled}
                          onCheckedChange={() => handleToggleAgent(agent.id)}
                        />
                        <div>
                          <Label
                            htmlFor={agent.id}
                            className="text-base font-medium cursor-pointer"
                          >
                            {agent.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={agent.weight}
                            onChange={(e) => handleWeightChange(agent.id, parseInt(e.target.value) || 0)}
                            disabled={!agent.enabled}
                            className="h-8"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="analysis-agents" className="space-y-4 pt-4">
              <div className="space-y-4">
                {agentSettings
                  .filter((agent) => ['valuation_agent', 'sentiment_agent', 'fundamentals_agent', 'technicals_agent'].includes(agent.id))
                  .map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                      <div className="flex flex-1 items-start space-x-3">
                        <Checkbox
                          id={agent.id}
                          checked={agent.enabled}
                          onCheckedChange={() => handleToggleAgent(agent.id)}
                        />
                        <div>
                          <Label
                            htmlFor={agent.id}
                            className="text-base font-medium cursor-pointer"
                          >
                            {agent.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={agent.weight}
                            onChange={(e) => handleWeightChange(agent.id, parseInt(e.target.value) || 0)}
                            disabled={!agent.enabled}
                            className="h-8"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div>
            <p className="text-sm">
              Total Weight: <strong>{totalWeight}%</strong>
              {totalWeight !== 100 && totalWeight !== 0 && (
                <span className="ml-2 text-red-500">
                  (Should equal 100%)
                </span>
              )}
            </p>
          </div>
          <Button 
            disabled={totalWeight !== 100 && totalWeight !== 0}
            onClick={handleSave}
          >
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 