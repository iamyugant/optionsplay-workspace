'use client';

import React, { useMemo, useState } from 'react';
import { CheckSquare, Columns3, LayoutGrid, Rows3, Square, Zap } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Menu } from '@/components/ui/Dropdown';
import { Tabs } from '@/components/ui/Tabs';
import { cn, formatCurrency } from '@/lib/utils';
import { getCreditSpreads, type CreditSpread } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';

type Filter = 'all' | 'bull' | 'bear' | 'call' | 'put';
type View = 'table' | 'cards';

const ALL_COLUMNS = ['symbol', 'bias', 'type', 'price', 'sellStrike', 'buyStrike', 'expiry', 'premium', 'width', 'premWidth', 'winRate', 'ivRank', 'action'] as const;
type ColumnId = (typeof ALL_COLUMNS)[number];
const OPTIONAL: { id: ColumnId; label: string }[] = [
  { id: 'price', label: 'Price' },
  { id: 'sellStrike', label: 'Sell strike' },
  { id: 'buyStrike', label: 'Buy strike' },
  { id: 'expiry', label: 'Expiry' },
  { id: 'width', label: 'Width' },
  { id: 'winRate', label: 'Win rate' },
  { id: 'ivRank', label: 'IV rank' },
];

export const CreditSpreadsWidget: React.FC<WidgetProps> = ({ shell }) => {
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const activeSymbol = useDashboardStore((s) => s.activeSymbol);
  const openTradeTicket = useDashboardStore((s) => s.openTradeTicket);

  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('table');
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState<ColumnId[]>(['width', 'ivRank']);
  const rows = useMemo(() => getCreditSpreads(), []);

  const counts = useMemo(
    () => ({
      all: rows.length,
      bull: rows.filter((r) => r.bias === 'Bullish').length,
      bear: rows.filter((r) => r.bias === 'Bearish').length,
      call: rows.filter((r) => r.type === 'Call').length,
      put: rows.filter((r) => r.type === 'Put').length,
    }),
    [rows]
  );

  const data = useMemo(
    () =>
      rows.filter((r) => {
        const matchesFilter =
          filter === 'all' ||
          (filter === 'bull' && r.bias === 'Bullish') ||
          (filter === 'bear' && r.bias === 'Bearish') ||
          (filter === 'call' && r.type === 'Call') ||
          (filter === 'put' && r.type === 'Put');
        const q = query.trim().toUpperCase();
        return matchesFilter && (!q || r.symbol.includes(q));
      }),
    [rows, filter, query]
  );

  const trade = (r: CreditSpread) =>
    openTradeTicket({
      symbol: r.symbol,
      strategy: `${r.bias} ${r.type} credit spread`,
      bias: r.bias,
      legs: `Sell 1 ${r.symbol} ${r.expiry} ${r.sellStrike} ${r.type} / Buy 1 ${r.buyStrike} ${r.type}`,
      price: r.premium,
      maxProfit: Math.round(r.premium * 100),
      maxRisk: Math.round((r.width - r.premium) * 100),
      probability: r.winRate,
      kind: 'credit',
    });

  const baseColumns: ColumnDef<CreditSpread>[] = [
    {
      id: 'symbol',
      header: 'Symbol',
      accessor: (r) => r.symbol,
      sortable: true,
      cell: (r) => <span className="font-semibold text-fg-primary">{r.symbol}</span>,
    },
    { id: 'bias', header: 'Bias', accessor: (r) => r.bias, sortable: true, cell: (r) => <Badge size="sm" variant={r.bias === 'Bullish' ? 'bullish' : 'bearish'}>{r.bias}</Badge> },
    { id: 'type', header: 'Type', accessor: (r) => r.type, sortable: true, cell: (r) => <Badge size="sm" variant="info">{r.type}</Badge> },
    { id: 'price', header: 'Price', align: 'right', accessor: (r) => r.price, sortable: true, cell: (r) => formatCurrency(r.price) },
    { id: 'sellStrike', header: 'Sell', align: 'right', accessor: (r) => r.sellStrike, sortable: true },
    { id: 'buyStrike', header: 'Buy', align: 'right', accessor: (r) => r.buyStrike, sortable: true },
    { id: 'expiry', header: 'Expiry', accessor: (r) => r.expiry, sortable: true, cell: (r) => <span className="text-fg-secondary">{r.expiry}</span> },
    { id: 'premium', header: 'Premium', align: 'right', accessor: (r) => r.premium, sortable: true, cell: (r) => formatCurrency(r.premium) },
    { id: 'width', header: 'Width', align: 'right', accessor: (r) => r.width, sortable: true },
    {
      id: 'premWidth',
      header: 'Prem/width',
      align: 'right',
      accessor: (r) => r.premWidth,
      sortable: true,
      cell: (r) => <span className={cn('font-medium', r.premWidth >= 33 ? 'text-fg-bullish' : 'text-fg-primary')}>{r.premWidth.toFixed(1)}%</span>,
    },
    { id: 'winRate', header: 'Win rate', align: 'right', accessor: (r) => r.winRate, sortable: true, cell: (r) => `${r.winRate}%` },
    { id: 'ivRank', header: 'IV rank', align: 'right', accessor: (r) => r.ivRank, sortable: true, cell: (r) => `${r.ivRank}%` },
    {
      id: 'action',
      header: '',
      align: 'right',
      cell: (r) => (
        <Button
          variant="secondary"
          size="sm"
          iconLeading={<Zap className="size-3" />}
          onClick={(e) => {
            e.stopPropagation();
            trade(r);
          }}
        >
          Trade
        </Button>
      ),
    },
  ];
  const columns = baseColumns.map((c) => ({ ...c, hidden: hidden.includes(c.id as ColumnId) }));

  const visibleCount = ALL_COLUMNS.length - hidden.length;

  return (
    <WidgetShell
      {...shell}
      title="Credit Spreads"
      icon={<Rows3 className="size-4" />}
      info="Screened credit spreads ranked by premium relative to strike width."
      empty={data.length === 0}
      emptyTitle="No spreads match your filters"
      emptyDescription="Clear the symbol search or switch to another quick filter."
      emptyAction={
        <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setFilter('all'); }}>
          Reset filters
        </Button>
      }
      controlBar={
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            aria-label="Filter spreads"
            size="sm"
            activeId={filter}
            onChange={setFilter}
            items={[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'bull', label: 'Bull', count: counts.bull },
              { id: 'bear', label: 'Bear', count: counts.bear },
              { id: 'call', label: 'Call', count: counts.call },
              { id: 'put', label: 'Put', count: counts.put },
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
            containerClassName="w-32"
          />
          <div className="ml-auto flex items-center gap-1">
            <Menu
              align="end"
              items={OPTIONAL.map((col) => ({
                label: col.label,
                onSelect: () => setHidden((h) => (h.includes(col.id) ? h.filter((x) => x !== col.id) : [...h, col.id])),
                icon: hidden.includes(col.id) ? <Square className="size-3.5" /> : <CheckSquare className="size-3.5 text-fg-link" />,
              }))}
              trigger={({ toggle, ...aria }) => (
                <Button variant="ghost" size="sm" iconLeading={<Columns3 className="size-3.5" />} onClick={toggle} {...aria}>
                  {visibleCount} columns
                </Button>
              )}
            />
            <IconButton label="Table view" size="sm" active={view === 'table'} onClick={() => setView('table')}>
              <Rows3 className="size-4" aria-hidden="true" />
            </IconButton>
            <IconButton label="Card view" size="sm" active={view === 'cards'} onClick={() => setView('cards')}>
              <LayoutGrid className="size-4" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      }
      bodyClassName={view === 'table' ? 'p-0' : undefined}
    >
      {view === 'table' ? (
        <DataTable
          className="h-full p-4 pt-0"
          caption="Credit spread candidates"
          columns={columns}
          data={data}
          pageSize={8}
          getRowId={(r) => r.id}
          selectedRowId={data.find((r) => r.symbol === activeSymbol)?.id ?? null}
          onRowClick={(r) => setActiveSymbol(r.symbol)}
          resetKey={`${filter}-${query}`}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.slice(0, 12).map((r) => (
            <li key={r.id}>
              <article className="flex h-full flex-col gap-3 rounded-md border border-line-subtle p-3 transition-colors hover:border-line-strong">
                <header className="flex items-center justify-between">
                  <button type="button" onClick={() => setActiveSymbol(r.symbol)} className="text-h4 text-fg-primary hover:text-fg-link">
                    {r.symbol}
                  </button>
                  <span className="flex gap-1">
                    <Badge size="sm" variant={r.bias === 'Bullish' ? 'bullish' : 'bearish'}>{r.bias}</Badge>
                    <Badge size="sm" variant="info">{r.type}</Badge>
                  </span>
                </header>
                <p className="text-center">
                  <span className="block text-h1 text-fg-primary tabular">{r.premWidth.toFixed(1)}%</span>
                  <span className="text-overline text-fg-tertiary">premium / width</span>
                </p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-bodyMd">
                  {(
                    [
                      ['Sell', `$${r.sellStrike}`],
                      ['Buy', `$${r.buyStrike}`],
                      ['Premium', formatCurrency(r.premium)],
                      ['Expiry', `${r.expiry} · ${r.dte}d`],
                      ['Win rate', `${r.winRate}%`],
                      ['IV rank', `${r.ivRank}%`],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-fg-tertiary">{k}</dt>
                      <dd className="font-medium text-fg-primary tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Button variant="secondary" size="sm" fullWidth iconLeading={<Zap className="size-3.5" />} onClick={() => trade(r)}>
                  Trade this spread
                </Button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
};
