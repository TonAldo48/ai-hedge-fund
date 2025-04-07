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

type PriceChartProps = {
  data: {
    date: string;
    price: number;
  }[];
  height?: number;
}

export function PriceChart({ data, height = 400 }: PriceChartProps) {
  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 30,
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
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            className="text-xs text-muted-foreground"
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
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
            dataKey="price"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 