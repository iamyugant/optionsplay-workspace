'use client';

import React, { useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { IconButton } from '@/components/ui/Button';
import { PriceChange } from '@/components/ui/PriceChange';
import { Sparkline } from '@/components/ui/Sparkline';
import { SymbolSearch } from '@/components/ui/SymbolSearch';
import { cn, focusRing } from '@/lib/utils';
import { findSymbol } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMarketStore } from '@/store/marketStore';

export const QuoteBoardWidget: React.FC<WidgetProps> = ({ shell }) => {
  const { watchlist, activeSymbol, setActiveSymbol, toggleWatch, notify } = useDashboardStore();
  const quotes = useMarketStore((s) => s.quotes);
  const streaming = useMarketStore((s) => s.streaming);
  const [adding, setAdding] = useState(false);

  return (
    <WidgetShell
      {...shell}
      title="Quote Board"
      icon={<Star className="size-4" />}
      info="Your watchlist with simulated live prices. Select a row to drive the other widgets."
      empty={watchlist.length === 0}
      emptyTitle="Your watchlist is empty"
      emptyDescription="Add symbols to track prices and drive the rest of the dashboard."
      headerAside={
        <IconButton label="Add symbol to watchlist" size="xs" active={adding} onClick={() => setAdding((a) => !a)}>
          <Plus className="size-4" aria-hidden="true" />
        </IconButton>
      }
      controlBar={
        adding ? (
          <SymbolSearch
            size="sm"
            autoFocus
            exclude={watchlist}
            placeholder="Add a symbol…"
            onSelect={(s) => {
              toggleWatch(s.ticker);
              setAdding(false);
              notify(`${s.ticker} added to your watchlist`, 'success');
            }}
          />
        ) : undefined
      }
      footer={
        <span className="flex items-center gap-1.5">
          <span className={cn('size-1.5 rounded-full', streaming ? 'animate-pulse bg-semantic-success-600' : 'bg-semantic-neutral-400')} aria-hidden="true" />
          {streaming ? 'Live simulated feed' : 'Feed paused'} · {watchlist.length} symbols
        </span>
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-line-subtle">
        {watchlist.map((ticker) => {
          const quote = quotes[ticker];
          const info = findSymbol(ticker);
          if (!quote || !info) return null;
          const selected = ticker === activeSymbol;
          return (
            <li key={ticker} className="group/row relative">
              <button
                type="button"
                onClick={() => setActiveSymbol(ticker)}
                aria-current={selected ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                  selected ? 'bg-surface-selected' : 'hover:bg-surface-subtle',
                  focusRing
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-bodyLg font-semibold text-fg-primary">{ticker}</span>
                  <span className="truncate text-caption text-fg-tertiary">{info.name}</span>
                </span>
                <Sparkline data={quote.history.slice(-24)} width={56} height={20} fill={false} />
                <span className="flex w-24 flex-col items-end">
                  <span
                    key={quote.price}
                    className={cn(
                      'rounded-sm px-1 text-bodyLg font-medium text-fg-primary tabular',
                      quote.lastMove === 1 && 'animate-flash-up',
                      quote.lastMove === -1 && 'animate-flash-down'
                    )}
                  >
                    {quote.price.toFixed(2)}
                  </span>
                  <PriceChange value={quote.changePct} format="percent" size="sm" />
                </span>
              </button>
              <IconButton
                label={`Remove ${ticker} from watchlist`}
                size="xs"
                tone="danger"
                onClick={() => toggleWatch(ticker)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </IconButton>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
};
