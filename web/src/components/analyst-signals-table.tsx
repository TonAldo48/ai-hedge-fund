'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AnalystSignal } from '@/lib/api';

interface AnalystSignalsTableProps {
  signals: AnalystSignal[];
}

export default function AnalystSignalsTable({ signals }: AnalystSignalsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getSignalColorClass = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
        return 'text-green-600';
      case 'BEARISH':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal, index) => (
            <TableRow key={index}>
              <TableCell>{signal.date}</TableCell>
              <TableCell className={getSignalColorClass(signal.signal)}>
                {signal.signal}
              </TableCell>
              <TableCell className="text-right">{formatConfidence(signal.confidence)}</TableCell>
              <TableCell className="text-right">{formatCurrency(signal.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 