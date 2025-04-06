'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CirclePlus, Save, Trash2 } from 'lucide-react'

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

interface CustomAgentFormProps {
  onSave: (agent: AgentProfile) => void
  initialProfile?: AgentProfile
}

// Focus areas for the AI agents
const focusAreas = [
  { id: 'technical_analysis', label: 'Technical Analysis' },
  { id: 'fundamental_analysis', label: 'Fundamental Analysis' },
  { id: 'sentiment_analysis', label: 'Sentiment Analysis' },
  { id: 'macro_economics', label: 'Macroeconomic Factors' },
  { id: 'valuation', label: 'Valuation Metrics' },
  { id: 'growth', label: 'Growth Potential' },
  { id: 'dividends', label: 'Dividend Income' },
  { id: 'momentum', label: 'Price Momentum' },
  { id: 'volatility', label: 'Volatility Patterns' },
  { id: 'esg', label: 'ESG Considerations' }
]

// Personality archetypes
const personalityTypes = [
  { id: 'rational', label: 'Rational & Analytical', description: 'Makes decisions based on data and logic' },
  { id: 'aggressive', label: 'Aggressive Growth', description: 'Seeks high returns with higher risk tolerance' },
  { id: 'conservative', label: 'Conservative', description: 'Prioritizes safety and lower risk' },
  { id: 'contrarian', label: 'Contrarian', description: 'Goes against prevailing market sentiment' },
  { id: 'trend_follower', label: 'Trend Follower', description: 'Follows established market trends' },
  { id: 'custom', label: 'Custom (Define your own)', description: 'Create a unique personality profile' }
]

export function CustomAgentForm({ onSave, initialProfile }: CustomAgentFormProps) {
  const [agent, setAgent] = useState<AgentProfile>(
    initialProfile || {
      id: Date.now().toString(),
      name: '',
      role: '',
      description: '',
      personality: 'rational',
      riskTolerance: 50,
      timeHorizon: 'medium_term',
      focusAreas: ['fundamental_analysis', 'valuation'],
      isActive: true
    }
  )

  const [selectedPersonality, setSelectedPersonality] = useState(
    initialProfile?.personality || 'rational'
  )

  const [customPersonality, setCustomPersonality] = useState(
    selectedPersonality === 'custom' ? agent.personality : ''
  )

  const handlePersonalityChange = (value: string) => {
    setSelectedPersonality(value)
    if (value !== 'custom') {
      setAgent({ ...agent, personality: value })
    } else {
      // When selecting custom, keep the existing custom text
      setAgent({ ...agent, personality: customPersonality || 'Custom personality' })
    }
  }

  const handleCustomPersonalityChange = (value: string) => {
    setCustomPersonality(value)
    if (selectedPersonality === 'custom') {
      setAgent({ ...agent, personality: value })
    }
  }

  const handleFocusAreaToggle = (id: string) => {
    setAgent(prev => {
      const isSelected = prev.focusAreas.includes(id)
      return {
        ...prev,
        focusAreas: isSelected
          ? prev.focusAreas.filter(areaId => areaId !== id)
          : [...prev.focusAreas, id]
      }
    })
  }

  const handleSliderChange = (value: number[]) => {
    setAgent({ ...agent, riskTolerance: value[0] })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave(agent)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create Custom AI Agent</CardTitle>
          <CardDescription>
            Configure your AI trading agent's personality and strategy parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="e.g., My Value Investor"
                value={agent.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgent({ ...agent, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-role">Role/Specialty</Label>
              <Input
                id="agent-role"
                placeholder="e.g., Value Investor"
                value={agent.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgent({ ...agent, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              placeholder="Describe what makes this agent unique and how it approaches trading decisions..."
              value={agent.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgent({ ...agent, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Personality Profile</Label>
            <RadioGroup
              value={selectedPersonality}
              onValueChange={handlePersonalityChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2"
            >
              {personalityTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={type.id} id={`personality-${type.id}`} />
                  <div className="space-y-1">
                    <Label
                      htmlFor={`personality-${type.id}`}
                      className="font-medium cursor-pointer text-sm"
                    >
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {selectedPersonality === 'custom' && (
              <div className="mt-4">
                <Label htmlFor="custom-personality">Custom Personality Description</Label>
                <Textarea
                  id="custom-personality"
                  placeholder="Describe the personality traits of your agent..."
                  value={customPersonality}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCustomPersonalityChange(e.target.value)}
                  rows={3}
                  required={selectedPersonality === 'custom'}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label className="mb-2 block">Risk Tolerance</Label>
              <div className="px-1">
                <Slider
                  value={[agent.riskTolerance]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleSliderChange}
                  className="my-5"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative (Low Risk)</span>
                  <span>Balanced</span>
                  <span>Aggressive (High Risk)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-horizon">Time Horizon</Label>
            <Select
              value={agent.timeHorizon}
              onValueChange={(value) => setAgent({ ...agent, timeHorizon: value as any })}
            >
              <SelectTrigger id="time-horizon">
                <SelectValue placeholder="Select time horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short_term">Short-term (Days to Weeks)</SelectItem>
                <SelectItem value="medium_term">Medium-term (Weeks to Months)</SelectItem>
                <SelectItem value="long_term">Long-term (Months to Years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="mb-3 block">Analysis Focus Areas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {focusAreas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`focus-${area.id}`}
                    checked={agent.focusAreas.includes(area.id)}
                    onCheckedChange={() => handleFocusAreaToggle(area.id)}
                  />
                  <Label
                    htmlFor={`focus-${area.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-active"
              checked={agent.isActive}
              onCheckedChange={(checked) => setAgent({ ...agent, isActive: !!checked })}
            />
            <Label htmlFor="is-active" className="cursor-pointer">
              Active (agent will participate in simulations)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Agent
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
} 