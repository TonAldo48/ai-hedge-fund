'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { SimulationConfig } from '@/lib/api';

interface SimulationFormProps {
  onSubmit: (config: SimulationConfig) => void;
  isLoading: boolean;
}

export default function SimulationForm({ onSubmit, isLoading }: SimulationFormProps) {
  const [ticker, setTicker] = useState('AAPL');
  const [analyst, setAnalyst] = useState('default');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [initialCash, setInitialCash] = useState('10000');
  const [model, setModel] = useState('default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      // TODO: Add date validation error
      return;
    }

    onSubmit({
      ticker,
      analyst,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      initialCash: parseFloat(initialCash),
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="ticker" className="text-sm font-medium">
            Ticker Symbol
          </label>
          <Input
            id="ticker"
            placeholder="e.g., AAPL"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="analyst" className="text-sm font-medium">
            Analyst
          </label>
          <Select value={analyst} onValueChange={setAnalyst} required>
            <SelectTrigger>
              <SelectValue placeholder="Select an analyst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Analyst</SelectItem>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
              <SelectItem value="llm">LLM-based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
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
          <label className="text-sm font-medium">End Date</label>
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

        <div className="space-y-2">
          <label htmlFor="initialCash" className="text-sm font-medium">
            Initial Cash ($)
          </label>
          <Input
            id="initialCash"
            type="number"
            placeholder="10000"
            value={initialCash}
            onChange={(e) => setInitialCash(e.target.value)}
            min="1000"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium">
            Model
          </label>
          <Select value={model} onValueChange={setModel} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Model</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="momentum">Momentum-based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? 'Running Simulation...' : 'Run Simulation'}
      </Button>
    </form>
  );
} 