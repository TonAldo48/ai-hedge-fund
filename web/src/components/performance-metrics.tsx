'use client';

import { Card, CardContent } from '@/components/ui/card';

interface PerformanceMetricsProps {
  performance: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

export default function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatRatio = (value: number) => {
    return value.toFixed(2);
  };

  const getColorClass = (value: number, isNegativeBad = true) => {
    if (value === 0) return 'text-gray-500';
    return value > 0 
      ? (isNegativeBad ? 'text-green-600' : 'text-red-600')
      : (isNegativeBad ? 'text-red-600' : 'text-green-600');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Total Return</div>
          <div className={`text-2xl font-bold mt-2 ${getColorClass(performance.totalReturn)}`}>
            {formatPercent(performance.totalReturn)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Annualized Return</div>
          <div className={`text-2xl font-bold mt-2 ${getColorClass(performance.annualizedReturn)}`}>
            {formatPercent(performance.annualizedReturn)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Max Drawdown</div>
          <div className={`text-2xl font-bold mt-2 ${getColorClass(-performance.maxDrawdown, false)}`}>
            {formatPercent(performance.maxDrawdown)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
          <div className={`text-2xl font-bold mt-2 ${getColorClass(performance.sharpeRatio)}`}>
            {formatRatio(performance.sharpeRatio)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 