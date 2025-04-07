'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts with SSR disabled
const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
});

// Define the data structure for our candlestick chart
export type CandlestickDataPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

interface ApexCandlestickChartProps {
  data: CandlestickDataPoint[];
  height?: number;
  width?: string;
  dataSource?: string;
  lastUpdated?: string;
}

const ApexCandlestickChart: React.FC<ApexCandlestickChartProps> = ({
  data,
  height = 500,
  width = '100%',
  dataSource,
  lastUpdated,
}) => {
  // Add client-side only state
  const [isMounted, setIsMounted] = useState(false);

  // Run after component mounts to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format data for ApexCharts
  const seriesData = data.map(item => ({
    x: new Date(item.date),
    y: [item.open, item.high, item.low, item.close],
  }));

  // Get volume data if available
  const volumeData = data
    .filter(item => item.volume !== undefined)
    .map(item => ({
      x: new Date(item.date),
      y: item.volume,
    }));

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: height,
      id: 'candles',
      toolbar: {
        autoSelected: 'zoom',
        show: true,
      },
      background: '#0f172a',
      animations: {
        enabled: false,
      },
    },
    theme: {
      mode: 'dark',
    },
    title: {
      text: dataSource ? `Stock Price (${dataSource})` : 'Stock Price',
      align: 'left',
      style: {
        color: '#94a3b8',
      },
    },
    subtitle: {
      text: lastUpdated ? `Last updated: ${lastUpdated}` : undefined,
      align: 'left',
      style: {
        color: '#64748b',
        fontSize: '12px',
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: '#94a3b8',
        },
        formatter: (value: number) => `$${value.toFixed(2)}`,
      },
    },
    grid: {
      borderColor: 'rgba(30, 41, 59, 0.5)',
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22c55e',
          downward: '#ef4444',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        format: 'MMM dd, yyyy',
      },
      y: {
        formatter: (y: number[]) => {
          if (Array.isArray(y)) {
            return `Open: $${y[0].toFixed(2)} · High: $${y[1].toFixed(2)} · Low: $${y[2].toFixed(2)} · Close: $${y[3].toFixed(2)}`;
          }
          return `$${y.toFixed(2)}`;
        },
      },
    },
  };

  // Series data for chart
  const series = [
    {
      name: 'Price',
      data: seriesData,
    },
  ];

  // Check if we have data to display
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: `${height}px`, width }}
      >
        <span className="text-muted-foreground">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="apex-chart-container" style={{ height: `${height}px`, width }}>
      {isMounted && (
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={height}
          width={width}
        />
      )}
    </div>
  );
};

export default ApexCandlestickChart; 