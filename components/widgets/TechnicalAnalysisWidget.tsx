'use client';

import React, { useMemo } from 'react';
import { CalendarClock, LineChart, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge, biasVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceChange } from '@/components/ui/PriceChange';
import { Sparkline } from '@/components/ui/Sparkline';
import { SymbolSearch } from '@/components/ui/SymbolSearch';
import { cn, formatCompact, formatCurrency } from '@/lib/utils';
import { findSymbol, getTechnicals } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';
import { useQuote } from '@/store/marketStore';

const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <section className={cn('rounded-md border border-line-subtle p-3', className)}>
    <h3 className="mb-2 text-overline text-fg-tertiary">{title}</h3>
    {children}
  </section>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-1 text-bodyMd">
    <span className="text-fg-tertiary">{label}</span>
    {children}
  </div>
);

const Meter: React.FC<{ value: number; tone: 'blue' | 'amber' | 'success'; readout?: string }> = ({ value, tone, readout }) => (
  <div className="flex flex-1 items-center gap-2">
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
      <div
        className={cn('h-full rounded-full', { blue: 'bg-brand-blue-600', amber: 'bg-semantic-amber-500', success: 'bg-semantic-success-600' }[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    <span className="w-10 text-right text-bodyMd font-medium text-fg-primary tabular">{readout ?? `${Math.round(value)}%`}</span>
  </div>
);

export const TechnicalAnalysisWidget: React.FC<WidgetProps> = ({ shell }) => {
  const activeSymbol = useDashboardStore((s) => s.activeSymbol);
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const setAiOpen = useDashboardStore((s) => s.setAiOpen);
  const quote = useQuote(activeSymbol);
  const info = findSymbol(activeSymbol);
  const ta = useMemo(() => getTechnicals(activeSymbol, quote?.price ?? info?.basePrice ?? 100), [activeSymbol, quote?.price, info?.basePrice]);

  if (!quote || !info) return <WidgetShell {...shell} title="Technical Analysis" error={`No data for ${activeSymbol}`} children={null} />;

  const rangePct = ((quote.price - ta.week52.low) / Math.max(0.01, ta.week52.high - ta.week52.low)) * 100;
  const TrendIcon = (bias: string) => (bias === 'Bullish' ? TrendingUp : bias === 'Bearish' ? TrendingDown : LineChart);

  return (
    <WidgetShell
      {...shell}
      title="Technical Analysis"
      icon={<LineChart className="size-4" />}
      info="Trend, liquidity, implied volatility rank and key price levels for the selected symbol."
      controlBar={
        <div className="flex flex-wrap items-center gap-2">
          <SymbolSearch size="sm" value={activeSymbol} onSelect={(s) => setActiveSymbol(s.ticker)} className="max-w-48" />
          <Badge variant={biasVariant(ta.bias)} dot>
            {ta.bias}
          </Badge>
          <Button variant="tertiary" size="sm" className="ml-auto" iconLeading={<Sparkles className="size-3.5" />} onClick={() => setAiOpen(true)}>
            Ask AI
          </Button>
        </div>
      }
      footer={
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          Next earnings: {ta.nextEarnings}
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-caption text-fg-tertiary">
              {info.name} · {info.sector}
            </p>
            <p className="flex items-baseline gap-2">
              <span className="text-h1 text-fg-primary tabular">{formatCurrency(quote.price)}</span>
              <PriceChange value={quote.change} percent={quote.changePct} icon />
            </p>
          </div>
          <Sparkline data={quote.history} width={120} height={40} />
        </div>

        <p className="rounded-md bg-surface-subtle p-3 text-bodyMd text-fg-secondary">{ta.summary}</p>

        <Panel title="Trend analysis">
          {(
            [
              ['1-month trend', ta.trend1m],
              ['6-month trend', ta.trend6m],
            ] as const
          ).map(([label, trend]) => {
            const Icon = TrendIcon(trend.bias);
            return (
              <Row key={label} label={label}>
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-bodyMd font-medium',
                    trend.bias === 'Bullish' ? 'text-fg-bullish' : trend.bias === 'Bearish' ? 'text-fg-bearish' : 'text-fg-secondary'
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {trend.bias}
                  <span className="text-fg-tertiary tabular">{trend.strength}/5</span>
                </span>
              </Row>
            );
          })}
        </Panel>

        <Panel title="Rankings">
          <Row label="Liquidity">
            <span className="flex items-center gap-2">
              <span className="flex items-end gap-0.5" aria-hidden="true">
                {[1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={cn('w-1 rounded-sm', bar <= ta.liquidity.bars ? 'bg-semantic-success-600' : 'bg-surface-muted')}
                    style={{ height: 4 + bar * 3 }}
                  />
                ))}
              </span>
              <span className="text-bodyMd font-medium text-fg-primary">{ta.liquidity.label}</span>
            </span>
          </Row>
          <Row label="IV rank">
            <Meter value={ta.ivRank} tone={ta.ivRank > 50 ? 'amber' : 'blue'} />
          </Row>
          <Row label="Technical score">
            <Meter value={ta.technicalScore * 10} tone="success" readout={`${ta.technicalScore}/10`} />
          </Row>
        </Panel>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(
            [
              ['Volume', formatCompact(quote.volume)],
              ['Market cap', `$${formatCompact(ta.marketCap)}`],
              ['EPS', formatCurrency(ta.eps)],
              ['P/E ratio', ta.pe.toFixed(2)],
              ['Div yield', `${ta.divYield.toFixed(2)}%`],
              ['Bid / Ask', `${quote.bid.toFixed(2)} / ${quote.ask.toFixed(2)}`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-md border border-line-subtle p-2">
              <p className="text-overline text-fg-tertiary">{label}</p>
              <p className="text-bodyLg font-medium text-fg-primary tabular">{value}</p>
            </div>
          ))}
        </div>

        <Panel title="52-week range">
          <div className="flex items-center gap-3">
            <span className="text-bodyMd text-fg-tertiary tabular">{formatCurrency(ta.week52.low)}</span>
            <div className="relative h-1.5 flex-1 rounded-full bg-gradient-to-r from-semantic-red-200 via-semantic-amber-200 to-semantic-success-200">
              <span
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-default bg-brand-blue-600"
                style={{ left: `${Math.min(100, Math.max(0, rangePct))}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="text-bodyMd text-fg-tertiary tabular">{formatCurrency(ta.week52.high)}</span>
          </div>
          <p className="mt-2 text-caption text-fg-tertiary">
            Trading {rangePct.toFixed(0)}% of the way through its 52-week range.
          </p>
        </Panel>

        <Panel title="Key price levels">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['Support', ta.support, 'bg-semantic-success-100 text-semantic-success-800'],
                ['Resistance', ta.resistance, 'bg-semantic-red-100 text-semantic-red-800'],
              ] as const
            ).map(([label, levels, tone]) => (
              <div key={label}>
                <p className="mb-1.5 text-caption text-fg-tertiary">{label} levels</p>
                <ul className="flex flex-col gap-1.5">
                  {levels.map((lvl) => (
                    <li key={`${label}-${lvl.price}`} className={cn('flex items-center justify-between rounded-sm px-2 py-1 text-bodyMd font-medium tabular', tone)}>
                      <span>{formatCurrency(lvl.price)}</span>
                      <span className="text-caption font-normal">{lvl.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </WidgetShell>
  );
};
