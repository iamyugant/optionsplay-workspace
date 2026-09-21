'use client';

import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge, biasVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceChange } from '@/components/ui/PriceChange';
import { Tabs } from '@/components/ui/Tabs';
import { cn, focusRing } from '@/lib/utils';
import { findSymbol, TRADE_IDEAS } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMarketStore } from '@/store/marketStore';

type Filter = 'all' | 'bullish' | 'bearish';

export const TradeIdeasWidget: React.FC<WidgetProps> = ({ shell }) => {
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const setAiOpen = useDashboardStore((s) => s.setAiOpen);
  const quotes = useMarketStore((s) => s.quotes);
  const [filter, setFilter] = useState<Filter>('all');

  const ideas = TRADE_IDEAS.filter((i) => filter === 'all' || i.bias.toLowerCase() === filter);

  return (
    <WidgetShell
      {...shell}
      title="Trade Ideas"
      icon={<Lightbulb className="size-4" />}
      info="Daily scanner results explaining why each setup qualified."
      empty={ideas.length === 0}
      emptyTitle="No ideas for this bias"
      controlBar={
        <Tabs
          aria-label="Filter ideas"
          size="sm"
          activeId={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: 'All', count: TRADE_IDEAS.length },
            { id: 'bullish', label: 'Bullish', count: TRADE_IDEAS.filter((i) => i.bias === 'Bullish').length },
            { id: 'bearish', label: 'Bearish', count: TRADE_IDEAS.filter((i) => i.bias === 'Bearish').length },
          ]}
        />
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-line-subtle">
        {ideas.map((idea) => {
          const quote = quotes[idea.symbol];
          const info = findSymbol(idea.symbol);
          return (
            <li key={idea.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => setActiveSymbol(idea.symbol)} className={cn('rounded-sm text-left', focusRing)}>
                  <span className="flex items-center gap-2">
                    <span className="text-bodyLg font-semibold text-fg-primary">{idea.symbol}</span>
                    <Badge size="sm" variant={biasVariant(idea.bias)}>
                      {idea.bias}
                    </Badge>
                  </span>
                  <span className="block text-caption text-fg-tertiary">{info?.name}</span>
                </button>
                {quote && (
                  <span className="flex flex-col items-end">
                    <span className="text-bodyLg font-medium text-fg-primary tabular">{quote.price.toFixed(2)}</span>
                    <PriceChange value={quote.changePct} format="percent" size="sm" />
                  </span>
                )}
              </div>
              <p className="text-overline text-fg-tertiary">{idea.setup}</p>
              <p className="text-bodyMd text-fg-secondary">{idea.rationale}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-fg-tertiary tabular">Technical score {idea.technicalScore}/10</span>
                <Button variant="tertiary" size="sm" className="px-0" onClick={() => setAiOpen(true)}>
                  Build a strategy
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
};
