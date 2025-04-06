'use client'

import { useState, useEffect } from 'react'
import { CustomAgentForm } from '@/components/custom-agent-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CirclePlus, ShieldCheck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AgentProfile {
  id: string
  name: string
  role: string
  description: string
  personality: string
  riskTolerance: number
  timeHorizon: 'short_term' | 'medium_term' | 'long_term'
  focusAreas: string[]
  isActive: boolean
}

export default function CustomAgentPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load saved agents on page load
  useEffect(() => {
    const savedAgents = localStorage.getItem('customAgents')
    if (savedAgents) {
      try {
        setAgents(JSON.parse(savedAgents))
      } catch (error) {
        console.error('Error loading saved agents:', error)
      }
    }
  }, [])

  const handleCreateNew = () => {
    setIsCreating(true)
    setSuccessMessage(null)
  }

  const handleSaveAgent = (agent: AgentProfile) => {
    let updatedAgents: AgentProfile[]
    
    // Check if we're updating an existing agent or adding a new one
    const existingIndex = agents.findIndex(a => a.id === agent.id)
    
    if (existingIndex >= 0) {
      // Update existing agent
      updatedAgents = agents.map((a, idx) => idx === existingIndex ? agent : a)
      setSuccessMessage(`Agent "${agent.name}" successfully updated`)
    } else {
      // Add new agent
      updatedAgents = [...agents, agent]
      setSuccessMessage(`Agent "${agent.name}" successfully created`)
    }
    
    setAgents(updatedAgents)
    localStorage.setItem('customAgents', JSON.stringify(updatedAgents))
    setIsCreating(false)
    
    // Clear success message after a delay
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Custom AI Agents</h2>
        <p className="text-muted-foreground">
          Create and manage your own custom AI trading agents
        </p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isCreating ? (
        <CustomAgentForm onSave={handleSaveAgent} />
      ) : (
        <div className="grid gap-6">
          {agents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map(agent => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent}
                  onEdit={() => {
                    setIsCreating(true)
                    setSuccessMessage(null)
                  }}
                />
              ))}
              <Button
                variant="outline"
                className="h-[250px] border-dashed flex flex-col gap-2 items-center justify-center"
                onClick={handleCreateNew}
              >
                <CirclePlus className="h-8 w-8 text-muted-foreground" />
                <span>Create New Agent</span>
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Your First Agent</CardTitle>
                <CardDescription>
                  You haven't created any custom AI trading agents yet
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center mb-6 text-muted-foreground">
                  Custom agents allow you to define unique trading personalities
                  and strategies for your simulations
                </p>
                <Button onClick={handleCreateNew}>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

interface AgentCardProps {
  agent: AgentProfile
  onEdit: () => void
}

function AgentCard({ agent, onEdit }: AgentCardProps) {
  const getRiskLabel = (risk: number) => {
    if (risk < 33) return 'Low Risk'
    if (risk < 66) return 'Moderate Risk'
    return 'High Risk'
  }
  
  const getTimeHorizonLabel = (horizon: string) => {
    switch (horizon) {
      case 'short_term': return 'Short-term'
      case 'medium_term': return 'Medium-term'
      case 'long_term': return 'Long-term'
      default: return horizon
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{agent.name}</CardTitle>
          {agent.isActive && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          )}
        </div>
        <CardDescription>{agent.role}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Risk:</span>{" "}
            <span className="font-medium">{getRiskLabel(agent.riskTolerance)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Horizon:</span>{" "}
            <span className="font-medium">{getTimeHorizonLabel(agent.timeHorizon)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Focus:</span>{" "}
            <span className="font-medium">{agent.focusAreas.slice(0, 2).join(', ')}{agent.focusAreas.length > 2 ? '...' : ''}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onEdit}
        >
          Edit Agent
        </Button>
      </CardContent>
    </Card>
  )
} 