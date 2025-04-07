'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ReferenceLine,
} from 'recharts'
import { ReactElement } from 'react'

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

// Define the extended data structure for our candle chart
interface CandleDataPoint extends StockDataPoint {
  isUp: boolean
  color: string
  wickTop: number
  wickBottom: number
  bodyTop: number
  bodyBottom: number
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-[500px] items-center justify-center text-muted-foreground">No data available</div>;
  }

  // Colors for dark theme
  const upColor = '#22c55e'    // Green color for up candles
  const downColor = '#ef4444'  // Red color for down candles

  // Transform data for candlestick representation
  const chartData = data.map((item) => {
    const isUp = item.close >= item.open;
    
    // Calculate candle metrics
    const bodyTop = isUp ? item.close : item.open;
    const bodyBottom = isUp ? item.open : item.close;
    
    return {
      ...item,
      isUp,
      color: isUp ? upColor : downColor,
      wickTop: item.high,
      wickBottom: item.low,
      bodyTop,
      bodyBottom,
    };
  });

  // Extract min/max for domain calculations
  const minLow = Math.min(...chartData.map(d => d.low));
  const maxHigh = Math.max(...chartData.map(d => d.high));
  const priceRange = maxHigh - minLow;
  const yDomain = [
    minLow - (priceRange * 0.05), // Add 5% padding at bottom
    maxHigh + (priceRange * 0.05)  // Add 5% padding at top
  ];

  return (
    <div className="h-[500px] w-full bg-[#0f172a]">
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
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(30, 41, 59, 0.5)"
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8' }}
            fontSize={12}
          />
          <YAxis
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8' }}
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            formatter={(value: number, name: any) => {
              // Only process numeric values
              if (typeof value !== 'number') return ['', ''];
              
              // Use string literals directly for better type safety
              if (name === 'high') return [`$${value.toFixed(2)}`, 'High'];
              if (name === 'low') return [`$${value.toFixed(2)}`, 'Low'];
              if (name === 'open') return [`$${value.toFixed(2)}`, 'Open'];
              if (name === 'close') return [`$${value.toFixed(2)}`, 'Close'];
              if (name === 'volume') return [`${value.toLocaleString()}`, 'Volume'];
              
              // For any other values, use a simple capitalization
              return [`$${value.toFixed(2)}`, typeof name === 'string' 
                ? name.charAt(0).toUpperCase() + name.slice(1) 
                : 'Value'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#94a3b8',
            }}
          />
          
          {/* Render high-low wicks */}
          {chartData.map((entry, index) => (
            <Line
              key={`wick-${index}`}
              data={[entry]}
              type="monotone"
              dataKey="high"
              stroke={entry.color}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
              strokeWidth={1}
              legendType="none"
            />
          ))}
          
          {/* Render low-high wicks */}
          {chartData.map((entry, index) => (
            <Line
              key={`wick-low-${index}`}
              data={[entry]}
              type="monotone"
              dataKey="low"
              stroke={entry.color}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
              strokeWidth={1}
              legendType="none"
            />
          ))}

          {/* Render candle bodies as Bars */}
          <Bar
            dataKey="bodyTop"
            fill="transparent"
            stroke="none"
            isAnimationActive={false}
            barSize={8}
            shape={({ x, y, width, height, payload }: any): ReactElement => {
              const dataItem = payload as CandleDataPoint;
              
              if (!dataItem) {
                return <rect x={0} y={0} width={0} height={0} fill="transparent" />;
              }
              
              const bodyHeight = Math.max(
                dataItem.bodyTop - dataItem.bodyBottom,
                1
              );
              
              return (
                <rect
                  x={x - 4}
                  y={y}
                  width={8}
                  height={bodyHeight}
                  fill={dataItem.color}
                  stroke={dataItem.color}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
} 