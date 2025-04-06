'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, PenBox, User, UserCog } from 'lucide-react'

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Trading Agents</h2>
        <p className="text-muted-foreground">
          Configure and manage AI agents for your trading simulations
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle>Predefined Agents</CardTitle>
            </div>
            <CardDescription>
              Use our collection of AI agents modeled after famous investors
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Choose from AI agents based on well-known investment philosophies 
              like Warren Buffett, Cathie Wood, Peter Lynch, and more.
              Each agent brings their unique investment style to your simulations.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/agents/predefined">
                Explore Predefined Agents
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              <CardTitle>Custom AI Agents</CardTitle>
            </div>
            <CardDescription>
              Create your own custom AI agents with unique personality traits
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Design AI agents with custom risk profiles, investment philosophies,
              and trading strategies. Configure their personality, focus areas,
              and time horizons to match your investing style.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/agents/custom">
                Create Custom Agents
                <PenBox className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-xl font-semibold mb-3">How AI Agents Work</h3>
        <p className="mb-4">
          AI agents analyze market data, company fundamentals, and news to make
          investment decisions based on their configured personality and strategy.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-md bg-muted">
            <h4 className="font-medium mb-2">1. Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Agents process historical data and company information according to their
              focus areas and investment style.
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted">
            <h4 className="font-medium mb-2">2. Decision Making</h4>
            <p className="text-sm text-muted-foreground">
              Based on analysis, agents make buy/sell recommendations with
              reasoning that reflects their personality.
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted">
            <h4 className="font-medium mb-2">3. Simulation</h4>
            <p className="text-sm text-muted-foreground">
              Run simulations with multiple agents to see how different
              investment strategies would perform over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 