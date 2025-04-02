'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TradeDecision } from '@/lib/api';

interface TradeDecisionsTableProps {
  decisions: TradeDecision[];
}

export default function TradeDecisionsTable({ decisions }: TradeDecisionsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getActionColorClass = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'text-green-600';
      case 'SELL':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Position</TableHead>
            <TableHead className="text-right">Cash</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((decision, index) => (
            <TableRow key={index}>
              <TableCell>{decision.date}</TableCell>
              <TableCell className={getActionColorClass(decision.action)}>
                {decision.action}
              </TableCell>
              <TableCell className="text-right">{decision.shares}</TableCell>
              <TableCell className="text-right">{formatCurrency(decision.price)}</TableCell>
              <TableCell className="text-right">{decision.position}</TableCell>
              <TableCell className="text-right">{formatCurrency(decision.cash)}</TableCell>
              <TableCell className="text-right">{formatCurrency(decision.totalValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 