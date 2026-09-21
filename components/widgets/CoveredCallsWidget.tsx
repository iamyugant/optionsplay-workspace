'use client';

import React, { useMemo, useState } from 'react';
import { Percent, Zap } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency, seededRandom } from '@/lib/utils';
import { UNIVERSE } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';

type Strategy = 'covered-call' | 'short-put';

interface IncomeRow {
  id: string;
  symbol: string;
  stockPrice: number;
  strike: number;
  expiry: string;
  dte: number;
  mid: number;
  bid: number;
  ask: number;
  rawReturn: number;
  annualized: number;
  distance: number;
  ivRank: number;
}

function screenContracts(strategy: Strategy): IncomeRow[] {
  const rnd = seededRandom(`income-${strategy}`);
  return UNIVERSE.map((info, i) => {
    const otm = 0.02 + rnd() * 0.08;
    const strike = +(info.basePrice * (strategy === 'covered-call' ? 1 + otm : 1 - otm)).toFixed(strikeDecimals(info.basePrice));
    const dte = [14, 21, 30, 44, 60][Math.floor(rnd() * 5)];
    const mid = +(info.basePrice * (0.008 + rnd() * 0.035)).toFixed(2);
    const raw = (mid / info.basePrice) * 100;
    return {
      id: `${info.ticker}-${i}`,
      symbol: info.ticker,
      stockPrice: info.basePrice,
      strike,
      expiry: new Date(Date.UTC(2026, 3, 10 + dte)).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', timeZone: 'UTC' }),
      dte,
      mid,
      bid: +(mid * 0.94).toFixed(2),
      ask: +(mid * 1.06).toFixed(2),
      rawReturn: +raw.toFixed(2),
      annualized: +((raw * 365) / dte).toFixed(2),
      distance: +(otm * 100).toFixed(2),
      ivRank: Math.round(5 + rnd() * 80),
    };
  }).sort((a, b) => b.annualized - a.annualized);
}

const strikeDecimals = (price: number) => (price > 100 ? 0 : price > 20 ? 1 : 2);

export const CoveredCallsWidget: React.FC<WidgetProps> = ({ shell }) => {
  const openTradeTicket = useDashboardStore((s) => s.openTradeTicket);
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const [strategy, setStrategy] = useState<Strategy>('covered-call');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => screenContracts(strategy), [strategy]);
  const data = useMemo(() => {
    const q = query.trim().toUpperCase();
    return q ? rows.filter((r) => r.symbol.includes(q)) : rows;
  }, [rows, query]);

  const isCall = strategy === 'covered-call';

  const columns: ColumnDef<IncomeRow>[] = [
    { id: 'symbol', header: 'Symbol', accessor: (r) => r.symbol, sortable: true, cell: (r) => <span className="font-semibold">{r.symbol}</span> },
    { id: 'action', header: 'Action', cell: () => <Badge size="sm" variant={isCall ? 'bullish' : 'info'}>Sell to open</Badge> },
    { id: 'stockPrice', header: 'Stock', align: 'right', accessor: (r) => r.stockPrice, sortable: true, cell: (r) => formatCurrency(r.stockPrice) },
    { id: 'strike', header: 'Strike', align: 'right', accessor: (r) => r.strike, sortable: true, cell: (r) => formatCurrency(r.strike) },
    { id: 'expiry', header: 'Expiry', accessor: (r) => r.dte, sortable: true, cell: (r) => <span className="text-fg-secondary">{r.expiry} · {r.dte}d</span> },
    { id: 'mid', header: 'Mid', align: 'right', accessor: (r) => r.mid, sortable: true, cell: (r) => formatCurrency(r.mid) },
    { id: 'bidAsk', header: 'Bid / Ask', align: 'right', cell: (r) => `${r.bid.toFixed(2)} / ${r.ask.toFixed(2)}` },
    { id: 'rawReturn', header: 'Return', align: 'right', accessor: (r) => r.rawReturn, sortable: true, cell: (r) => `${r.rawReturn}%` },
    {
      id: 'annualized',
      header: 'Annualized',
      align: 'right',
      accessor: (r) => r.annualized,
      sortable: true,
      cell: (r) => <span className="font-medium text-fg-bullish">{r.annualized}%</span>,
    },
    { id: 'distance', header: isCall ? 'To strike' : 'Cushion', align: 'right', accessor: (r) => r.distance, sortable: true, cell: (r) => `${r.distance}%` },
    {
      id: 'trade',
      header: '',
      align: 'right',
      cell: (r) => (
        <Button
          variant="secondary"
          size="sm"
          iconLeading={<Zap className="size-3" />}
          onClick={(e) => {
            e.stopPropagation();
            openTradeTicket({
              symbol: r.symbol,
              strategy: isCall ? 'Covered call' : 'Cash-secured put',
              bias: isCall ? 'Neutral' : 'Bullish',
              legs: `Sell 1 ${r.symbol} ${r.expiry} ${r.strike} ${isCall ? 'Call' : 'Put'}`,
              price: r.mid,
              maxProfit: Math.round(r.mid * 100),
              maxRisk: Math.round((isCall ? r.stockPrice - r.mid : r.strike - r.mid) * 100),
              probability: 100 - r.distance * 2,
              kind: 'credit',
            });
          }}
        >
          Trade
        </Button>
      ),
    },
  ];

  return (
    <WidgetShell
      {...shell}
      title="Income Screener"
      icon={<Percent className="size-4" />}
      info="Covered calls and cash-secured puts ranked by annualized premium return."
      empty={data.length === 0}
      emptyTitle="No contracts match"
      emptyDescription="Try a different symbol."
      controlBar={
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            aria-label="Income strategy"
            size="sm"
            activeId={strategy}
            onChange={setStrategy}
            items={[
              { id: 'covered-call', label: 'Covered calls' },
              { id: 'short-put', label: 'Cash-secured puts' },
            ]}
          />
          <Input
            type="search"
            size="sm"
            placeholder="Symbol"
            aria-label="Filter by symbol"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            containerClassName="ml-auto w-32"
          />
        </div>
      }
      bodyClassName="p-0"
    >
      <DataTable
        className="h-full p-4 pt-0"
        caption={isCall ? 'Covered call candidates' : 'Cash-secured put candidates'}
        columns={columns}
        data={data}
        pageSize={8}
        getRowId={(r) => r.id}
        onRowClick={(r) => setActiveSymbol(r.symbol)}
        resetKey={`${strategy}-${query}`}
      />
    </WidgetShell>
  );
};
