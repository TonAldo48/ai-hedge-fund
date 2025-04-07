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
    methodology: `Ben Graham's investment approach centers on the concept of "margin of safety" - purchasing securities at prices significantly below their intrinsic value. His methodology includes:

1. Quantitative Analysis: Examining balance sheets, income statements, and cash flow statements
2. Valuation Metrics: Focusing on P/E ratios, P/B ratios, and dividend yields
3. Financial Strength: Evaluating debt levels, current ratios, and working capital
4. Margin of Safety: Requiring at least a 33% discount to intrinsic value
5. Diversification: Holding 20-30 stocks across various industries

Graham's decision process eschews market timing and speculation, instead relying on fundamental business metrics and patience.`,
    enabled: true,
    weight: 10,
  },
  {
    id: 'bill_ackman',
    name: 'Bill Ackman',
    description: 'Activist investor who takes bold positions',
    methodology: `Bill Ackman's investment philosophy combines activism with concentrated positions. Key elements of his approach include:

1. Concentration: Taking large positions in a small number of high-conviction ideas
2. Business Quality: Focusing on simple, predictable, cash-generating businesses
3. Activism: Engaging with management to unlock shareholder value through operational changes, financial engineering, or governance reforms
4. Contrarian Thinking: Identifying situations where market sentiment diverges from underlying value
5. Catalyst Identification: Seeking specific events that could trigger valuation re-ratings

Ackman's process involves intensive research, engagement with management, and often public advocacy for his investment theses.`,
    enabled: true,
    weight: 10,
  },
  {
    id: 'cathie_wood',
    name: 'Cathie Wood',
    description: 'Growth investor focused on disruptive innovation',
    methodology: `Cathie Wood's approach centers on identifying disruptive innovation and exponential growth opportunities. Her methodology includes:

1. Thematic Research: Focusing on technological innovations like AI, genomics, fintech, and robotics
2. Top-down Analysis: Starting with broad technological trends and identifying companies at the forefront
3. Five-Year Time Horizon: Focusing on long-term growth rather than short-term volatility
4. Wright's Law: Using cost decline curves to model adoption rates of new technologies
5. Public Markets Venture Capital: Applying VC-like investment principles to public equities

Wood seeks companies with potential to deliver 15%+ annual returns over five years, often accepting high valuations and volatility for exponential growth potential.`,
    enabled: false,
    weight: 0,
  },
  {
    id: 'charlie_munger',
    name: 'Charlie Munger',
    description: 'Focused on wonderful businesses at fair prices',
    methodology: `Charlie Munger's investment approach emphasizes high-quality businesses and multidisciplinary thinking. His methodology includes:

1. Mental Models: Applying concepts from various disciplines (psychology, mathematics, engineering, etc.)
2. High-Quality Businesses: Seeking companies with durable competitive advantages and high returns on capital
3. Circle of Competence: Only investing in businesses he thoroughly understands
4. Rational Temperament: Avoiding behavioral biases and maintaining emotional discipline
5. Long-term Holding: Keeping great businesses for decades, minimizing taxes and transaction costs

Munger's famous "four filters" for investment decisions are: 1) Can I understand it? 2) Does it have sustainable competitive advantages? 3) Is management trustworthy and competent? 4) Is the price reasonable?`,
    enabled: true,
    weight: 15,
  },
  {
    id: 'peter_lynch',
    name: 'Peter Lynch',
    description: 'Growth investor seeking "ten-baggers"',
    methodology: `Peter Lynch's approach combines growth investing with practical, on-the-ground research. His methodology includes:

1. Invest in What You Know: Starting with companies and products you personally understand
2. Six Categories: Classifying stocks as slow growers, stalwarts, fast growers, cyclicals, turnarounds, or asset plays
3. "Ten-baggers": Seeking companies with potential to grow 10x in value
4. Story Assessment: Evaluating whether a company's "story" makes logical sense
5. Fundamental Research: Focusing on P/E ratios relative to growth rates (PEG ratio)

Lynch believes individual investors have advantages over institutions through personal experience with products and local businesses, often identifying trends before Wall Street.`,
    enabled: false,
    weight: 0,
  },
  {
    id: 'phil_fisher',
    name: 'Phil Fisher',
    description: 'Growth investor with scuttlebutt approach',
    methodology: `Phil Fisher pioneered growth investing with his "scuttlebutt" research method. His approach includes:

1. Scuttlebutt Method: Gathering information from competitors, suppliers, customers, and industry experts
2. Growth Orientation: Focusing on companies with above-average sales and earnings growth potential
3. Management Quality: Evaluating management integrity, transparency, and long-term orientation
4. R&D Focus: Valuing companies that reinvest in research and development
5. Concentrated Portfolio: Holding a limited number of high-conviction positions

Fisher advocated buying great companies and holding them for the long term, famously stating "I don't want a lot of good investments; I want a few outstanding ones."`,
    enabled: false,
    weight: 0,
  },
  {
    id: 'stanley_druckenmiller',
    name: 'Stanley Druckenmiller',
    description: 'Macro investor seeking asymmetric opportunities',
    methodology: `Stanley Druckenmiller combines macro analysis with concentrated position-taking. His methodology includes:

1. Asymmetric Risk/Reward: Finding opportunities with limited downside and substantial upside
2. Macro Analysis: Incorporating interest rates, currency movements, and global economic trends
3. Concentration: Taking large positions when conviction is high
4. Flexibility: Quickly adapting to changing market conditions and reversing positions when wrong
5. Liquidity Focus: Paying careful attention to money flows and central bank policies

Druckenmiller emphasizes the importance of capital preservation during drawdowns while aggressively pursuing returns when conditions are favorable, stating "It's not whether you're right or wrong, but how much money you make when right and how much you lose when wrong."`,
    enabled: true,
    weight: 15,
  },
  {
    id: 'warren_buffett',
    name: 'Warren Buffett',
    description: 'Seeks wonderful companies at fair prices',
    methodology: `Warren Buffett's investment approach evolved from Graham's deep value to quality businesses at reasonable prices. His methodology includes:

1. Business Understanding: Investing only in companies with simple, understandable business models
2. Economic Moat: Seeking businesses with sustainable competitive advantages
3. Management Quality: Assessing integrity, talent, and shareholder orientation
4. Margin of Safety: Purchasing at prices below intrinsic value calculation
5. Long-term Perspective: Viewing stocks as ownership in businesses rather than trading vehicles

Buffett emphasizes circle of competence, stating "Risk comes from not knowing what you're doing." He looks for companies with predictable earnings, high returns on equity, and limited capital requirements.`,
    enabled: true,
    weight: 20,
  },
  {
    id: 'valuation_agent',
    name: 'Valuation Agent',
    description: 'Calculates intrinsic value of stocks',
    methodology: `The Valuation Agent employs multiple quantitative models to determine a stock's intrinsic value. Its methodology includes:

1. Discounted Cash Flow (DCF): Projecting future cash flows and discounting to present value
2. Dividend Discount Model: Valuing stocks based on expected future dividends
3. Earnings Multiples: Comparing P/E, EV/EBITDA, and other ratios to historical averages and peers
4. Asset-Based Valuation: Calculating net asset value and replacement costs
5. Reverse Engineering: Determining what growth is implied by current market prices

The agent combines these methods using a weighted approach based on industry characteristics and company maturity stage, providing a range of fair values rather than a single point estimate.`,
    enabled: true,
    weight: 10,
  },
  {
    id: 'sentiment_agent',
    name: 'Sentiment Agent',
    description: 'Analyzes market sentiment',
    methodology: `The Sentiment Agent analyzes investor psychology and market emotions. Its methodology includes:

1. News Analysis: Processing financial news using natural language processing
2. Social Media Tracking: Monitoring Twitter, Reddit, and other platforms for sentiment shifts
3. Options Market: Analyzing put/call ratios and implied volatility
4. Technical Patterns: Identifying price patterns that reflect crowd psychology
5. Contrarian Indicators: Looking for excessive optimism or pessimism as contrary signals

The agent uses machine learning algorithms to quantify sentiment across different time frames, distinguishing between short-term noise and meaningful sentiment shifts that might present investment opportunities.`,
    enabled: false,
    weight: 0,
  },
  {
    id: 'fundamentals_agent',
    name: 'Fundamentals Agent',
    description: 'Analyzes fundamental data',
    methodology: `The Fundamentals Agent examines companies' financial health and business performance. Its methodology includes:

1. Financial Statement Analysis: Examining income statements, balance sheets, and cash flow statements
2. Ratio Analysis: Calculating profitability, efficiency, liquidity, and solvency metrics
3. Growth Trend Evaluation: Assessing revenue, earnings, and margin trends over multiple periods
4. Industry Benchmarking: Comparing metrics to industry averages and direct competitors
5. Quality of Earnings: Identifying potential accounting red flags or earnings manipulation

The agent uses machine learning to detect patterns in fundamental data that precede stock outperformance or underperformance, placing special emphasis on rate-of-change metrics rather than absolute values.`,
    enabled: true,
    weight: 10,
  },
  {
    id: 'technicals_agent',
    name: 'Technicals Agent',
    description: 'Analyzes technical indicators',
    methodology: `The Technicals Agent utilizes price and volume patterns to identify trading opportunities. Its methodology includes:

1. Trend Analysis: Identifying primary, secondary, and tertiary price trends using moving averages
2. Momentum Indicators: Utilizing RSI, MACD, and stochastic oscillators to measure price momentum
3. Support/Resistance: Identifying key price levels where buying or selling pressure may emerge
4. Volume Analysis: Confirming price movements with corresponding volume patterns
5. Chart Patterns: Recognizing formations like head-and-shoulders, double tops/bottoms, etc.

The agent combines these indicators into a comprehensive technical score, avoiding single-indicator decisions in favor of confirmation across multiple technical factors.`,
    enabled: true,
    weight: 10,
  },
]

export default function PredefinedAgentsPage() {
  const [agentSettings, setAgentSettings] = useState(agents)
  const [successMessage, setSuccessMessage] = useState("")
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({})
  
  const toggleExpandAgent = (agentId: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }))
  }
  
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
                    <div key={agent.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-1 items-start space-x-3">
                          <Checkbox
                            id={agent.id}
                            checked={agent.enabled}
                            onCheckedChange={() => handleToggleAgent(agent.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={agent.id}
                              className="text-base font-medium cursor-pointer"
                            >
                              {agent.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 h-7 px-2 text-xs"
                              onClick={() => toggleExpandAgent(agent.id)}
                            >
                              {expandedAgents[agent.id] ? 'Hide methodology' : 'Show methodology'}
                            </Button>
                            
                            {expandedAgents[agent.id] && (
                              <div className="mt-3 text-sm p-3 rounded-md bg-muted/50">
                                <h4 className="font-medium mb-2">Investment Methodology</h4>
                                <div className="whitespace-pre-line">
                                  {agent.methodology}
                                </div>
                              </div>
                            )}
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
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="analysis-agents" className="space-y-4 pt-4">
              <div className="space-y-4">
                {agentSettings
                  .filter((agent) => ['valuation_agent', 'sentiment_agent', 'fundamentals_agent', 'technicals_agent'].includes(agent.id))
                  .map((agent) => (
                    <div key={agent.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-1 items-start space-x-3">
                          <Checkbox
                            id={agent.id}
                            checked={agent.enabled}
                            onCheckedChange={() => handleToggleAgent(agent.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={agent.id}
                              className="text-base font-medium cursor-pointer"
                            >
                              {agent.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 h-7 px-2 text-xs"
                              onClick={() => toggleExpandAgent(agent.id)}
                            >
                              {expandedAgents[agent.id] ? 'Hide methodology' : 'Show methodology'}
                            </Button>
                            
                            {expandedAgents[agent.id] && (
                              <div className="mt-3 text-sm p-3 rounded-md bg-muted/50">
                                <h4 className="font-medium mb-2">Analysis Methodology</h4>
                                <div className="whitespace-pre-line">
                                  {agent.methodology}
                                </div>
                              </div>
                            )}
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
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">
              Total weight: <span className={totalWeight === 100 ? "font-medium" : "font-medium text-yellow-500 dark:text-yellow-400"}>{totalWeight}%</span>
              {totalWeight !== 100 && (
                <span className="ml-2 text-yellow-500 dark:text-yellow-400">
                  {totalWeight < 100 ? `(${100 - totalWeight}% remaining)` : `(${totalWeight - 100}% over limit)`}
                </span>
              )}
            </div>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 