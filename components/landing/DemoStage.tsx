'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, GripVertical, LayoutGrid, LineChart, MousePointer2, Percent, Plus, Rows3, Search, Sparkles, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/ui/Sparkline';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { PriceChange } from '@/components/ui/PriceChange';

// A miniature, prop-driven rendering of the real dashboard. It is built from the same tokens and
// primitives as the product and scaled down by StageFrame, so the marketing visuals cannot drift.

export type MiniWidgetKind = 'analysis' | 'screener' | 'watchlist' | 'strategies' | 'calendar' | 'income';

export interface MiniWidget {
  id: string;
  kind: MiniWidgetKind;
  span: 1 | 2 | 3 | 4;
  height: number;
}

export interface DemoStageProps {
  widgets: MiniWidget[];
  libraryOpen?: boolean;
  gridOverlay?: boolean;
  selectedId?: string | null;
  resizingId?: string | null;
  ticketOpen?: boolean;
  published?: boolean;
  toast?: string | null;
  templatePicker?: boolean;
  highlightLibraryIndex?: number | null;
  tick?: number;
  cursor?: { x: number; y: number; clicking?: boolean } | null;
}

const META: Record<MiniWidgetKind, { title: string; icon: React.ReactNode }> = {
  analysis: { title: 'Technical Analysis', icon: <LineChart className="size-4" /> },
  screener: { title: 'Credit Spreads', icon: <Rows3 className="size-4" /> },
  watchlist: { title: 'Quote Board', icon: <Star className="size-4" /> },
  strategies: { title: 'Top Strategies', icon: <LayoutGrid className="size-4" /> },
  calendar: { title: 'DailyPlay Journal', icon: <CalendarDays className="size-4" /> },
  income: { title: 'Income Screener', icon: <Percent className="size-4" /> },
};

const LIBRARY: MiniWidgetKind[] = ['analysis', 'screener', 'strategies', 'calendar', 'income'];

const QUOTES = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 251.08, change: 0.96 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 186.72, change: -0.42 },
  { ticker: 'SPY', name: 'SPDR S&P 500', price: 510.21, change: 0.36 },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 228.09, change: 2.02 },
  { ticker: 'MSFT', name: 'Microsoft', price: 428.15, change: -0.2 },
];

const SPREADS = [
  { symbol: 'XLP', bias: 'Bearish', type: 'Call', prem: 48.2, score: 78 },
  { symbol: 'NVDA', bias: 'Bullish', type: 'Put', prem: 38.0, score: 71 },
  { symbol: 'LLY', bias: 'Bullish', type: 'Put', prem: 37.8, score: 64 },
  { symbol: 'MA', bias: 'Bearish', type: 'Call', prem: 39.1, score: 55 },
  { symbol: 'V', bias: 'Bearish', type: 'Call', prem: 42.3, score: 51 },
];

const STRATEGIES = [
  { name: 'Buy 1 AAPL Apr 10 250/255 Call Vertical', bias: 'Bullish', prob: 58.2, score: 88 },
  { name: 'Sell 1 NVDA Apr 10 180/170 Put Vertical', bias: 'Bullish', prob: 65.5, score: 79 },
  { name: 'Buy 1 TSLA Apr 10 220/235 Iron Condor', bias: 'Neutral', prob: 68.3, score: 70 },
  { name: 'Sell 1 XLP Apr 10 77/78 Call Vertical', bias: 'Bearish', prob: 61.8, score: 61 },
];

const SERIES = [8, 9, 8.4, 10, 9.6, 11, 10.4, 12, 13, 12.4, 14, 15, 14.2, 16];

const MiniBody: React.FC<{ kind: MiniWidgetKind; tick: number }> = ({ kind, tick }) => {
  switch (kind) {
    case 'analysis':
      return (
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-caption text-fg-tertiary">Apple Inc. · Technology</p>
              <p className="flex items-baseline gap-2">
                <span className="text-h2 text-fg-primary tabular">${(251.08 + tick * 0.13).toFixed(2)}</span>
                <PriceChange value={2.39 + tick * 0.13} percent={0.96} size="sm" />
              </p>
            </div>
            <Sparkline data={SERIES.map((v, i) => v + (i > 9 ? tick * 0.3 : 0))} width={110} height={36} />
          </div>
          <p className="rounded-md bg-surface-subtle p-2 text-bodyMd text-fg-secondary">Apple Inc. is in a bullish trend with support at $246.48.</p>
          <div className="flex flex-col gap-2">
            {(
              [
                ['Liquidity', 78, 'bg-semantic-success-600'],
                ['IV rank', 39, 'bg-brand-blue-600'],
                ['Technical', 64, 'bg-semantic-amber-500'],
              ] as const
            ).map(([label, value, tone]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-16 text-caption text-fg-tertiary">{label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span className={cn('block h-full rounded-full', tone)} style={{ width: `${value}%` }} />
                </span>
                <span className="w-8 text-right text-caption text-fg-primary tabular">{value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <span className="rounded-sm bg-semantic-success-100 px-2 py-1 text-caption font-medium text-semantic-success-800 tabular">Support $246.48</span>
            <span className="rounded-sm bg-semantic-red-100 px-2 py-1 text-right text-caption font-medium text-semantic-red-800 tabular">Res. $258.94</span>
          </div>
        </div>
      );

    case 'screener':
      return (
        <div className="flex h-full flex-col gap-2">
          <div className="flex gap-1">
            {['All (49)', 'Bull (27)', 'Bear (22)', 'Call (22)', 'Put (27)'].map((t, i) => (
              <span key={t} className={cn('rounded-sm px-2 py-0.5 text-caption font-medium', i === 0 ? 'bg-action-primary text-fg-inverse' : 'bg-surface-subtle text-fg-tertiary')}>
                {t}
              </span>
            ))}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-subtle text-caption text-fg-tertiary">
                {['Symbol', 'Bias', 'Type', 'Prem/width', 'Score'].map((h, i) => (
                  <th key={h} className={cn('py-1 font-medium', i > 2 ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPREADS.map((r) => (
                <tr key={r.symbol} className="border-b border-line-subtle last:border-0">
                  <td className="py-1.5 text-bodyMd font-semibold text-fg-primary">{r.symbol}</td>
                  <td className="py-1.5">
                    <Badge size="sm" variant={r.bias === 'Bullish' ? 'bullish' : 'bearish'}>
                      {r.bias}
                    </Badge>
                  </td>
                  <td className="py-1.5">
                    <Badge size="sm" variant="info">
                      {r.type}
                    </Badge>
                  </td>
                  <td className="py-1.5 text-right text-bodyMd text-fg-secondary tabular">{r.prem.toFixed(1)}%</td>
                  <td className="py-1.5 text-right">
                    <ScoreBadge score={r.score} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-auto text-caption text-fg-tertiary">Showing 1 to 5 of 49 items</p>
        </div>
      );

    case 'watchlist':
      return (
        <ul className="flex flex-col">
          {QUOTES.map((q, i) => {
            const price = q.price + (i % 2 === 0 ? tick * 0.11 : -tick * 0.08);
            return (
              <li key={q.ticker} className="flex items-center gap-2 border-b border-line-subtle py-1.5 last:border-0">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-bodyMd font-semibold text-fg-primary">{q.ticker}</span>
                  <span className="truncate text-caption text-fg-tertiary">{q.name}</span>
                </span>
                <Sparkline data={SERIES.slice(i % 4).map((v) => v + i)} width={44} height={16} fill={false} />
                <span className="flex w-20 flex-col items-end">
                  <span key={price.toFixed(2)} className={cn('rounded-sm px-1 text-bodyMd text-fg-primary tabular', tick > 0 && (i % 2 === 0 ? 'animate-flash-up' : 'animate-flash-down'))}>
                    {price.toFixed(2)}
                  </span>
                  <PriceChange value={q.change} format="percent" size="sm" />
                </span>
              </li>
            );
          })}
        </ul>
      );

    case 'strategies':
      return (
        <ul className="flex flex-col gap-1.5">
          {STRATEGIES.map((s) => (
            <li key={s.name} className="flex items-center gap-2 border-b border-line-subtle pb-1.5 last:border-0">
              <Badge size="sm" variant={s.bias === 'Bullish' ? 'bullish' : s.bias === 'Bearish' ? 'bearish' : 'neutral'}>
                {s.bias}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-bodyMd text-fg-secondary">{s.name}</span>
              <span className="text-caption text-fg-tertiary tabular">{s.prob}%</span>
              <ScoreBadge score={s.score} size="sm" />
              <span className="rounded-sm border border-brand-blue-600 px-2 py-0.5 text-caption font-medium text-fg-link">Trade</span>
            </li>
          ))}
        </ul>
      );

    case 'calendar':
      return (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ['Win rate', '81%', 'text-fg-bullish'],
                ['Targets hit', '22', 'text-fg-primary'],
                ['Open', '3', 'text-fg-warning'],
              ] as const
            ).map(([l, v, tone]) => (
              <span key={l} className="rounded-md border border-line-subtle py-1">
                <span className="block text-overline text-fg-tertiary">{l}</span>
                <span className={cn('block text-h4 tabular', tone)}>{v}</span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'aspect-square rounded-full',
                  i % 7 === 5 ? 'bg-semantic-red-600' : i % 5 === 0 ? 'bg-semantic-amber-400' : i % 3 === 0 ? 'border-2 border-semantic-red-500' : 'bg-semantic-success-600'
                )}
              />
            ))}
          </div>
        </div>
      );

    case 'income':
      return (
        <ul className="flex flex-col gap-1.5">
          {[
            ['POET', 106.2],
            ['APLD', 102.5],
            ['QBTS', 85.4],
            ['ASTS', 82.7],
          ].map(([s, v], i) => (
            <li key={s as string} className="flex items-center gap-2 border-b border-line-subtle pb-1.5 last:border-0">
              <span className="w-14 text-bodyMd font-semibold text-fg-primary">{s}</span>
              <Badge size="sm" variant="bullish">
                Sell to open
              </Badge>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <span className="block h-full rounded-full bg-semantic-success-600" style={{ width: `${90 - i * 12}%` }} />
              </span>
              <span className="w-14 text-right text-bodyMd font-medium text-fg-bullish tabular">{(v as number).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      );
  }
};

const MiniWidgetCard: React.FC<{ widget: MiniWidget; selected: boolean; resizing: boolean; tick: number }> = ({ widget, selected, resizing, tick }) => (
  <div
    className={cn(
      'flex min-w-0 flex-col overflow-hidden rounded-lg border bg-surface-default transition-[width,height,border-color,box-shadow] duration-slow ease-standard animate-scale-in',
      selected ? 'border-brand-blue-600 ring-2 ring-brand-blue-100' : 'border-line-subtle',
      resizing && 'shadow-elevation-2'
    )}
    style={{ width: `calc(${widget.span * 25}% - 9px)`, height: widget.height }}
  >
    <div className="flex items-center gap-2 border-b border-line-subtle px-3 py-2">
      {selected && <GripVertical className="size-3.5 text-fg-disabled" />}
      <span className="text-fg-tertiary">{META[widget.kind].icon}</span>
      <span className="truncate text-bodyLg font-medium text-fg-primary">{META[widget.kind].title}</span>
      {resizing && <span className="ml-auto rounded-sm bg-surface-inverse px-1.5 text-overline text-fg-inverse tabular">{widget.span} col</span>}
    </div>
    <div className="min-h-0 flex-1 overflow-hidden p-3">
      <MiniBody kind={widget.kind} tick={tick} />
    </div>
  </div>
);

export const DemoStage: React.FC<DemoStageProps> = ({
  widgets,
  libraryOpen = false,
  gridOverlay = false,
  selectedId = null,
  resizingId = null,
  ticketOpen = false,
  published = false,
  toast = null,
  templatePicker = false,
  highlightLibraryIndex = null,
  tick = 0,
  cursor = null,
}) => (
  <div className="relative flex size-full flex-col bg-surface-canvas" aria-hidden="true">
    {/* App header */}
    <div className="flex shrink-0 items-center gap-3 border-b border-line-subtle bg-surface-default px-4 py-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-brand-blue-600 text-caption font-bold text-fg-inverse">OP</span>
      <span className="text-bodyLg font-semibold text-fg-primary">OptionsPlay</span>
      <span className="ml-2 rounded-md bg-surface-selected px-2 py-1 text-bodyMd font-medium text-fg-link">Dashboard</span>
      <span className="px-2 text-bodyMd text-fg-tertiary">Design System</span>
      <span className="ml-auto flex items-center gap-1.5 rounded-md border border-line-default px-2 py-1">
        <Search className="size-3.5 text-fg-tertiary" />
        <span className="text-bodyMd text-fg-tertiary">AAPL</span>
      </span>
      <span className="flex items-center gap-1 rounded-md bg-brand-green-500 px-2 py-1 text-bodyMd font-medium text-fg-primary">
        <Sparkles className="size-3.5" /> Ask OptionsPlay
      </span>
    </div>

    {/* Toolbar */}
    <div className="flex shrink-0 items-center gap-2 border-b border-line-subtle bg-surface-default px-4 py-1.5">
      <span className="text-bodyLg font-medium text-fg-primary">Options Trader</span>
      <Badge size="sm" variant={published ? 'bullish' : 'warning'} dot={published}>
        {published ? 'Live' : 'Unsaved'}
      </Badge>
      <span className="text-caption text-fg-tertiary tabular">{widgets.length} widgets</span>
      <span className="ml-auto flex items-center gap-1.5">
        {['Preview', 'Save'].map((l) => (
          <span key={l} className="rounded-md border border-line-default px-2 py-1 text-bodyMd text-fg-secondary">
            {l}
          </span>
        ))}
        <span className={cn('rounded-md px-2 py-1 text-bodyMd font-medium transition-colors duration-base', published ? 'bg-surface-muted text-fg-disabled' : 'bg-action-primary text-fg-inverse')}>
          Publish
        </span>
      </span>
    </div>

    {/* Body */}
    <div className="flex min-h-0 flex-1 gap-3 p-3">
      {libraryOpen && (
        <div className="flex w-44 shrink-0 flex-col gap-2 rounded-lg border border-line-subtle bg-surface-default p-2 animate-slide-up">
          <span className="text-bodyLg font-medium text-fg-primary">Widgets</span>
          <span className="flex items-center gap-1.5 rounded-md border border-line-subtle px-2 py-1">
            <Search className="size-3.5 text-fg-tertiary" />
            <span className="text-bodyMd text-fg-tertiary">Search widgets</span>
          </span>
          {LIBRARY.map((kind, i) => (
            <span
              key={kind}
              className={cn(
                'flex items-center gap-1.5 rounded-md border p-2 transition-colors duration-base',
                highlightLibraryIndex === i ? 'border-brand-blue-600 bg-surface-selected' : 'border-line-subtle'
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-sm bg-surface-subtle text-fg-link">{META[kind].icon}</span>
              <span className="truncate text-bodyMd text-fg-secondary">{META[kind].title}</span>
              <Plus className="ml-auto size-3 text-fg-disabled" />
            </span>
          ))}
        </div>
      )}

      <div className={cn('relative min-h-0 min-w-0 flex-1 rounded-lg', gridOverlay && 'grid-overlay')}>
        <div className="flex flex-wrap gap-3">
          {widgets.map((widg) => (
            <MiniWidgetCard key={widg.id} widget={widg} selected={selectedId === widg.id} resizing={resizingId === widg.id} tick={tick} />
          ))}
          {libraryOpen && (
            <span
              className="flex h-28 items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-default text-bodyMd text-fg-tertiary"
              style={{ width: 'calc(25% - 9px)' }}
            >
              <Plus className="size-4" /> Add a widget
            </span>
          )}
        </div>

        {templatePicker && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface-canvas/85 animate-fade-in">
            <div className="flex w-2/3 flex-col items-center gap-3 rounded-xl border border-line-default bg-surface-default p-5 shadow-elevation-2">
              <span className="text-h3 text-fg-primary">Ready to build your own dashboard?</span>
              <div className="flex w-full gap-3">
                {['Start from scratch', 'Start from a template', 'Duplicate a dashboard'].map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-center text-bodyMd transition-colors duration-base',
                      i === 1 && highlightLibraryIndex !== null ? 'border-brand-blue-600 bg-surface-selected text-fg-link' : 'border-line-default text-fg-secondary'
                    )}
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-surface-subtle text-fg-link">
                      <LayoutGrid className="size-4" />
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {ticketOpen && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface-inverse/40 animate-fade-in">
            <div className="w-96 overflow-hidden rounded-xl border border-line-default bg-surface-default shadow-elevation-3 animate-scale-in">
              <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-surface-selected text-fg-link">
                  <Zap className="size-4" />
                </span>
                <span className="text-h4 text-fg-primary">Order ticket</span>
                <Badge size="sm" variant="bullish" className="ml-auto">
                  Bullish
                </Badge>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  {['Scan', 'Analyze', 'Execute'].map((s, i) => (
                    <span key={s} className="flex flex-1 items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-action-primary text-caption font-medium text-fg-inverse">{i + 1}</span>
                      <span className="text-bodyMd text-fg-secondary">{s}</span>
                      {i < 2 && <span className="h-px flex-1 bg-action-primary" />}
                    </span>
                  ))}
                </div>
                <span className="rounded-md bg-surface-subtle p-2 font-mono text-bodyMd text-fg-secondary">Buy 1 AAPL Apr 10 250 Call / Sell 1 255 Call</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ['Net debit', '$185', 'text-fg-primary'],
                      ['Max risk', '$185', 'text-fg-bearish'],
                      ['Probability', '58.2%', 'text-fg-bullish'],
                    ] as const
                  ).map(([l, v, tone]) => (
                    <span key={l} className="rounded-md border border-line-subtle py-1.5">
                      <span className="block text-overline text-fg-tertiary">{l}</span>
                      <span className={cn('block text-bodyLg font-medium tabular', tone)}>{v}</span>
                    </span>
                  ))}
                </div>
                <span className="rounded-md bg-action-primary py-2 text-center text-bodyLg font-medium text-fg-inverse">Transmit order</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {toast && (
      <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-surface-inverse px-3 py-2 text-bodyMd text-fg-inverse shadow-elevation-3 animate-slide-up">
        <span className="size-2 rounded-full bg-semantic-success-400" />
        {toast}
      </div>
    )}

    {cursor && (
      <span className="pointer-events-none absolute z-20 transition-all duration-slow ease-standard" style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}>
        <MousePointer2 className="size-6 fill-surface-default text-fg-primary" />
        {cursor.clicking && <span className="absolute -left-3 -top-3 size-12 rounded-full border-2 border-brand-blue-600 opacity-70 animate-ping" />}
      </span>
    )}
  </div>
);

// Renders children at a fixed design size and scales them to the available width, which keeps
// the miniature on the real type scale instead of inventing 7px fonts.
export const StageFrame: React.FC<{
  designWidth?: number;
  designHeight: number;
  children: React.ReactNode;
  className?: string;
  /** Rendered as a browser-style chrome around the stage. */
  chrome?: boolean;
}> = ({ designWidth = 1160, designHeight, children, className, chrome = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / designWidth)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div className={cn('w-full', className)}>
      {chrome && (
        <div className="flex items-center gap-1.5 rounded-t-xl border border-b-0 border-line-default bg-surface-subtle px-3 py-2">
          <span className="size-2.5 rounded-full bg-semantic-red-300" />
          <span className="size-2.5 rounded-full bg-semantic-amber-300" />
          <span className="size-2.5 rounded-full bg-semantic-success-300" />
          <span className="ml-3 rounded-full bg-surface-default px-3 py-0.5 text-caption text-fg-tertiary">optionsplay.com/dashboard</span>
        </div>
      )}
      <div
        ref={ref}
        className={cn('relative w-full overflow-hidden border border-line-default bg-surface-canvas', chrome ? 'rounded-b-xl' : 'rounded-xl')}
        style={{ height: designHeight * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: designWidth, height: designHeight, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
