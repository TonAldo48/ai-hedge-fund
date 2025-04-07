'use client'

import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'

interface TradingViewChartProps {
  symbol: string;
  height?: number;
  width?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';  // Keep for backward compatibility but we'll use system theme
  dataSource?: string;
  lastUpdated?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  height = 500,
  width = '100%',
  interval = 'D',
  theme: propTheme,  // Renamed but kept for compatibility
  dataSource,
  lastUpdated,
}) => {
  const [isClient, setIsClient] = useState(false);
  const { theme: appTheme, systemTheme } = useTheme();
  
  // Determine the actual theme to use
  const effectiveTheme = 
    appTheme === 'system' 
      ? systemTheme || 'dark' 
      : appTheme || 'dark';
  
  // Format symbol for TradingView - add NASDAQ prefix for simple stock symbols
  const tvSymbol = /^[A-Z]{1,5}$/.test(symbol) ? `NASDAQ:${symbol}` : symbol;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple iframe-based TradingView chart
  return (
    <div className="trading-view-container">
      {dataSource && isClient && (
        <div className="text-xs text-muted-foreground mb-1">
          Data Source: {dataSource} {lastUpdated && `· Last updated: ${lastUpdated}`}
        </div>
      )}
      
      {!isClient ? (
        <div 
          style={{ height: `${height}px`, width }}
          className="flex items-center justify-center bg-background"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading chart...</span>
        </div>
      ) : (
        <iframe
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=${effectiveTheme}&style=1&timezone=exchange&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
          style={{ 
            width, 
            height: `${height}px`,
            border: 'none',
          }}
          allow="fullscreen"
          loading="lazy"
        />
      )}
    </div>
  );
};

export default TradingViewChart; 