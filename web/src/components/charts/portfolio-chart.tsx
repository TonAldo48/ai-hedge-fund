'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type PortfolioChartProps = {
  data: {
    date: string
    value: number
  }[]
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground"
          />
          <YAxis
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground"
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 