'use client'

import { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'

type AllocationData = {
  name: string
  symbol: string
  value: number
  color?: string
}

type AllocationChartProps = {
  data: AllocationData[]
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF',
  '#FF6B6B', '#54C5EB', '#8BC34A', '#F44336', '#9C27B0'
]

export function AllocationChart({ data }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="var(--foreground)">
          {payload.symbol}
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="var(--foreground)">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="var(--foreground)">
          ${value.toLocaleString()}
        </text>
        <text x={cx} y={cy} dy={40} textAnchor="middle" fill="var(--muted-foreground)">
          {(percent * 100).toFixed(1)}%
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 15}
          outerRadius={outerRadius + 18}
          fill={fill}
        />
      </g>
    )
  }

  const formattedData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }))

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
            contentStyle={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 