'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type StockDataPoint = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type CandlestickChartProps = {
  data: StockDataPoint[]
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  // Transform data for candlestick representation
  const chartData = data.map((item) => ({
    ...item,
    // For the bar (body of the candle)
    bodyTop: Math.max(item.open, item.close),
    bodyBottom: Math.min(item.open, item.close),
    bodyHeight: Math.abs(item.close - item.open),
    // Color of the candle
    color: item.close >= item.open ? 'var(--green)' : 'var(--red)',
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
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
            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
          {/* High-Low lines (wicks) */}
          {chartData.map((item, index) => (
            <Line
              key={`line-${index}`}
              dataKey="high"
              stroke={item.color}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
              dataPoints={[
                { x: index, y: item.high },
                { x: index, y: item.low },
              ]}
            />
          ))}
          
          {/* Candle bodies */}
          <Bar
            dataKey="bodyHeight"
            fill="transparent"
            stroke="none"
            barSize={8}
            shape={(props) => {
              const { x, y, width, height } = props
              // Safely access dataItem and provide fallbacks
              const dataItem = props.dataItem || {}
              const color = dataItem.color || 'var(--muted-foreground)' // Default fallback color
              
              return (
                <rect
                  x={x - width / 2}
                  y={dataItem.bodyBottom || y}
                  width={width}
                  height={dataItem.bodyHeight || height}
                  fill={color}
                  stroke={color}
                />
              )
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
} 