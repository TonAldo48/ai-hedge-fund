'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { SimulationConfig, AnalystType } from '@/lib/api';

interface SimulationFormProps {
  onSubmit: (config: SimulationConfig) => void;
  isLoading: boolean;
  initialConfig?: SimulationConfig;
}

// List of popular stock tickers
const popularTickers = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 
  'NVDA', 'TSLA', 'NFLX', 'PYPL', 'ADBE',
  'DIS', 'INTC', 'AMD', 'CSCO', 'IBM'
];

// LLM models
const models = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus (Anthropic)' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet (Anthropic)' },
  { value: 'llama-3-70b', label: 'Llama 3 70B (Groq)' },
  { value: 'llama-3-8b', label: 'Llama 3 8B (Groq)' },
];

// Analyst types with descriptions
const analystTypes = [
  { id: 'ben_graham', name: 'Ben Graham', description: 'Value investing pioneer' },
  { id: 'bill_ackman', name: 'Bill Ackman', description: 'Activist investor' },
  { id: 'cathie_wood', name: 'Cathie Wood', description: 'Growth and innovation investor' },
  { id: 'charlie_munger', name: 'Charlie Munger', description: 'Value investing legend' },
  { id: 'peter_lynch', name: 'Peter Lynch', description: 'Growth investor seeking "ten-baggers"' },
  { id: 'phil_fisher', name: 'Phil Fisher', description: 'Growth investor' },
  { id: 'stanley_druckenmiller', name: 'Stanley Druckenmiller', description: 'Macro investor' },
  { id: 'warren_buffett', name: 'Warren Buffett', description: 'Long-term value investor' },
  { id: 'technical_analyst', name: 'Technical Analyst', description: 'Technical indicators and patterns' },
  { id: 'fundamentals_analyst', name: 'Fundamentals Analyst', description: 'Financial statements analysis' },
  { id: 'sentiment_analyst', name: 'Sentiment Analyst', description: 'Market sentiment analysis' },
  { id: 'valuation_analyst', name: 'Valuation Analyst', description: 'Stock valuation expert' },
];

export default function SimulationForm({ onSubmit, isLoading, initialConfig }: SimulationFormProps) {
  const [tickers, setTickers] = useState<string[]>(['AAPL']);
  const [currentTicker, setCurrentTicker] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [initialCash, setInitialCash] = useState('100000');
  const [marginRequirement, setMarginRequirement] = useState('0');
  const [model, setModel] = useState('gpt-4o');
  const [showReasoning, setShowReasoning] = useState(false);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>(['warren_buffett', 'technical_analyst', 'fundamentals_analyst', 'valuation_analyst']);

  // When initialConfig is provided, update the form state
  useEffect(() => {
    if (initialConfig) {
      // Parse comma-separated tickers
      setTickers(initialConfig.ticker.split(','));
      
      // Parse dates
      if (initialConfig.startDate) {
        setStartDate(new Date(initialConfig.startDate));
      }
      if (initialConfig.endDate) {
        setEndDate(new Date(initialConfig.endDate));
      }
      
      // Set other values
      setInitialCash(initialConfig.initialCash.toString());
      setMarginRequirement(initialConfig.marginRequirement.toString());
      setModel(initialConfig.model);
      setShowReasoning(initialConfig.showReasoning);
      
      // Parse analyst selection
      if (initialConfig.analyst === 'all') {
        setSelectedAnalysts(analystTypes.map(a => a.id));
      } else if (typeof initialConfig.analyst === 'string') {
        setSelectedAnalysts(initialConfig.analyst.split(','));
      }
    }
  }, [initialConfig]);

  const handleAddTicker = () => {
    if (currentTicker && !tickers.includes(currentTicker.toUpperCase())) {
      setTickers([...tickers, currentTicker.toUpperCase()]);
      setCurrentTicker('');
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter(t => t !== ticker));
  };

  const handleAnalystToggle = (analystId: string) => {
    setSelectedAnalysts(prev => 
      prev.includes(analystId)
        ? prev.filter(id => id !== analystId)
        : [...prev, analystId]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      // TODO: Add date validation error
      return;
    }

    onSubmit({
      ticker: tickers.join(','),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      initialCash: parseFloat(initialCash),
      marginRequirement: parseFloat(marginRequirement),
      model,
      showReasoning,
      analyst: selectedAnalysts.length === analystTypes.length 
        ? 'all' 
        : selectedAnalysts.join(',') as AnalystType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Ticker Symbols</Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md mb-2">
            {tickers.map(ticker => (
              <div key={ticker} className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1">
                <span>{ticker}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveTicker(ticker)}
                  className="h-5 w-5 ml-1 text-primary"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex">
              <Input
                placeholder="Add ticker..."
                value={currentTicker}
                onChange={(e) => setCurrentTicker(e.target.value.toUpperCase())}
                className="h-8 w-24"
              />
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={handleAddTicker} 
                className="ml-1 h-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">Popular tickers:</div>
          <div className="flex flex-wrap gap-1">
            {popularTickers.map(ticker => (
              <Button
                key={ticker}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!tickers.includes(ticker)) {
                    setTickers([...tickers, ticker]);
                  }
                }}
                className="h-7"
                disabled={tickers.includes(ticker)}
              >
                {ticker}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initialCash" className="text-sm font-medium">
              Initial Cash ($)
            </Label>
            <Input
              id="initialCash"
              type="number"
              placeholder="100000"
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              min="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marginRequirement" className="text-sm font-medium">
              Margin Requirement (%)
            </Label>
            <Input
              id="marginRequirement"
              type="number"
              placeholder="0"
              value={marginRequirement}
              onChange={(e) => setMarginRequirement(e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {startDate ? format(startDate, 'PPP') : 'Select date'}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {endDate ? format(endDate, 'PPP') : 'Select date'}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-medium">
            LLM Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium block mb-2">
            AI Analysts
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-reasoning" 
                checked={showReasoning} 
                onCheckedChange={() => setShowReasoning(!showReasoning)} 
              />
              <Label htmlFor="show-reasoning" className="text-sm cursor-pointer">
                Show reasoning in results
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {analystTypes.map(analyst => (
                <div key={analyst.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={analyst.id} 
                    checked={selectedAnalysts.includes(analyst.id)} 
                    onCheckedChange={() => handleAnalystToggle(analyst.id)} 
                  />
                  <div>
                    <Label htmlFor={analyst.id} className="text-sm font-medium cursor-pointer">
                      {analyst.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{analyst.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? 'Running Simulation...' : 'Run Simulation'}
      </Button>
    </form>
  );
} 