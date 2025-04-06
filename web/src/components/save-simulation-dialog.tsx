'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Save, Loader2, Trash2 } from 'lucide-react'
import { SimulationConfig } from '@/lib/api'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SavedSimulation {
  id: string
  name: string
  description: string
  config: SimulationConfig
  createdAt: string
}

interface SaveSimulationDialogProps {
  currentConfig: SimulationConfig
  onLoadConfig: (config: SimulationConfig) => void
}

export function SaveSimulationDialog({ 
  currentConfig, 
  onLoadConfig 
}: SaveSimulationDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([])

  // Load saved simulations when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      loadSavedSimulations()
    }
  }

  const loadSavedSimulations = async () => {
    setLoading(true)
    // This would fetch from an API in production
    // For now we'll use localStorage
    try {
      const saved = localStorage.getItem('savedSimulations')
      if (saved) {
        setSavedSimulations(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved simulations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return

    setSaving(true)
    
    // Create a new saved simulation
    const newSimulation: SavedSimulation = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      config: currentConfig,
      createdAt: new Date().toISOString()
    }

    // Update local state
    const updatedSimulations = [...savedSimulations, newSimulation]
    setSavedSimulations(updatedSimulations)

    // Save to localStorage (would be an API call in production)
    localStorage.setItem('savedSimulations', JSON.stringify(updatedSimulations))

    // Reset form
    setName('')
    setDescription('')
    setSaving(false)
  }

  const handleDelete = (id: string) => {
    const updatedSimulations = savedSimulations.filter(sim => sim.id !== id)
    setSavedSimulations(updatedSimulations)
    localStorage.setItem('savedSimulations', JSON.stringify(updatedSimulations))
  }

  const handleLoad = (config: SimulationConfig) => {
    onLoadConfig(config)
    setOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          <span>Save/Load</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Simulation Configurations</DialogTitle>
          <DialogDescription>
            Save your current configuration or load a previously saved one
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="load">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="load">Load Simulation</TabsTrigger>
            <TabsTrigger value="save">Save Current</TabsTrigger>
          </TabsList>
          
          <TabsContent value="load" className="mt-4">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedSimulations.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">No saved configurations</p>
                  <p className="text-sm text-muted-foreground">
                    Switch to the "Save Current" tab to save your first configuration
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {savedSimulations.map((sim) => (
                    <div 
                      key={sim.id} 
                      className="flex flex-col rounded-md border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{sim.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {sim.description || 'No description provided'}
                          </p>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Saved on {formatDate(sim.createdAt)}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {sim.config.ticker}
                            </span>
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              ${sim.config.initialCash}
                            </span>
                            <span className="rounded-full bg-muted px-2 py-1 text-xs">
                              {sim.config.model}
                            </span>
                          </div>
                        </div>
                        <div className="flex">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(sim.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        className="mt-3 w-full"
                        size="sm"
                        onClick={() => handleLoad(sim.config)}
                      >
                        Load Configuration
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="save" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  placeholder="My Tesla Strategy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Long-term strategy focusing on Tesla"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="rounded-md bg-muted p-3">
                <h4 className="mb-2 font-medium">Configuration Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticker:</span>
                    <span>{currentConfig.ticker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Range:</span>
                    <span>{currentConfig.startDate} to {currentConfig.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Cash:</span>
                    <span>${currentConfig.initialCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{currentConfig.model}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSave}
                disabled={!name.trim() || saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 