'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, Layers, Zap } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge, biasVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { cn, focusRing, formatCurrency } from '@/lib/utils';
import { getStrategies, STRATEGIES, type StrategyIdea } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';

const PayoffChart: React.FC<{ idea: StrategyIdea }> = ({ idea }) => {
  const debit = idea.reward >= idea.risk;
  return (
    <svg viewBox="0 0 240 64" className="h-16 w-full" role="img" aria-label={`Payoff: max reward ${idea.reward} dollars, max risk ${idea.risk} dollars`}>
      <line x1="0" y1="32" x2="240" y2="32" stroke="var(--line-default)" strokeDasharray="3 3" />
      <path d={debit ? 'M8 52 L96 52 L150 12 L232 12' : 'M8 12 L96 12 L150 52 L232 52'} fill="none" stroke="var(--semantic-success-600)" strokeWidth="2" strokeLinejoin="round" />
      <path
        d={debit ? 'M8 52 L96 52 L123 32' : 'M123 32 L150 52 L232 52'}
        fill="none"
        stroke="var(--semantic-red-600)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="123" cy="32" r="3.5" fill="var(--brand-blue-600)" />
    </svg>
  );
};

export const TopStrategiesWidget: React.FC<WidgetProps> = ({ shell }) => {
  const openTradeTicket = useDashboardStore((s) => s.openTradeTicket);
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const [strategy, setStrategy] = useState<string>('all');
  const [sort, setSort] = useState<'score' | 'probability' | 'reward'>('score');
  const [expanded, setExpanded] = useState<string | null>(null);

  const ideas = useMemo(() => {
    const all = getStrategies();
    return all
      .filter((i) => strategy === 'all' || i.strategy === strategy)
      .sort((a, b) => b[sort] - a[sort]);
  }, [strategy, sort]);

  return (
    <WidgetShell
      {...shell}
      title="Top Strategies"
      icon={<Layers className="size-4" />}
      info="Ranked option strategies with probability of profit, cost, risk and reward."
      empty={ideas.length === 0}
      emptyTitle="No strategies for this filter"
      controlBar={
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            size="sm"
            aria-label="Strategy"
            className="w-52"
            value={strategy}
            onChange={setStrategy}
            options={[{ label: 'All strategies', value: 'all' }, ...STRATEGIES.map((s) => ({ label: s, value: s }))]}
          />
          <Dropdown
            size="sm"
            aria-label="Sort by"
            className="w-40"
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={[
              { label: 'Sort: Score', value: 'score' },
              { label: 'Sort: Probability', value: 'probability' },
              { label: 'Sort: Max reward', value: 'reward' },
            ]}
          />
          <span className="ml-auto text-caption text-fg-tertiary tabular">{ideas.length} ideas</span>
        </div>
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-line-subtle">
        {ideas.map((idea) => {
          const open = expanded === idea.id;
          return (
            <li key={idea.id}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setExpanded(open ? null : idea.id)}
                  className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-sm text-left', focusRing)}
                >
                  <ChevronDown className={cn('size-4 shrink-0 text-fg-tertiary transition-transform', open && 'rotate-180')} aria-hidden="true" />
                  <Badge variant={biasVariant(idea.bias)} size="sm">
                    {idea.bias}
                  </Badge>
                  <span className="min-w-0">
                    <span className="block truncate text-bodyLg text-fg-primary">{idea.title}</span>
                    <span className="block text-caption text-fg-tertiary">
                      {idea.strategy} · {idea.dte} days to expiry
                    </span>
                  </span>
                </button>

                <dl className="flex items-center gap-4 text-bodyMd tabular">
                  <div className="hidden text-center sm:block">
                    <dt className="text-overline text-fg-tertiary">Prob</dt>
                    <dd className="font-medium text-fg-primary">{idea.probability}%</dd>
                  </div>
                  <div className="hidden text-center md:block">
                    <dt className="text-overline text-fg-tertiary">Cost</dt>
                    <dd className="font-medium text-fg-primary">{formatCurrency(idea.cost)}</dd>
                  </div>
                  <div className="hidden text-center md:block">
                    <dt className="text-overline text-fg-tertiary">Risk</dt>
                    <dd className="font-medium text-fg-bearish">{formatCurrency(idea.risk)}</dd>
                  </div>
                  <div className="hidden text-center md:block">
                    <dt className="text-overline text-fg-tertiary">Reward</dt>
                    <dd className="font-medium text-fg-bullish">{formatCurrency(idea.reward)}</dd>
                  </div>
                  <div className="text-center">
                    <dt className="sr-only">Score</dt>
                    <dd>
                      <ScoreBadge score={idea.score} size="sm" />
                    </dd>
                  </div>
                </dl>

                <Button
                  variant="secondary"
                  size="sm"
                  iconLeading={<Zap className="size-3" />}
                  onClick={() =>
                    openTradeTicket({
                      symbol: idea.symbol,
                      strategy: idea.strategy,
                      bias: idea.bias,
                      legs: idea.legs.map((l) => `${l.side} ${l.qty} ${l.expiry} ${l.strike} ${l.type}`).join(' / '),
                      price: idea.cost / 100,
                      maxProfit: idea.reward,
                      maxRisk: idea.risk,
                      probability: idea.probability,
                      kind: idea.reward >= idea.risk ? 'debit' : 'credit',
                    })
                  }
                >
                  Trade
                </Button>
              </div>

              {open && (
                <div className="grid gap-4 border-t border-line-subtle bg-surface-subtle px-4 py-3 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-overline text-fg-tertiary">Legs</h4>
                    <ul className="flex flex-col gap-1">
                      {idea.legs.map((leg, i) => (
                        <li key={i} className="flex items-center justify-between rounded-sm bg-surface-default px-2 py-1 text-bodyMd tabular">
                          <span className={cn('font-medium', leg.side === 'Buy' ? 'text-fg-bullish' : 'text-fg-bearish')}>
                            {leg.side} {leg.qty}
                          </span>
                          <span className="text-fg-secondary">
                            {idea.symbol} {leg.expiry} ${leg.strike} {leg.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="tertiary" size="sm" className="mt-2 px-0" onClick={() => setActiveSymbol(idea.symbol)}>
                      Analyze {idea.symbol}
                    </Button>
                  </div>
                  <div>
                    <h4 className="mb-2 text-overline text-fg-tertiary">Payoff at expiry</h4>
                    <PayoffChart idea={idea} />
                    <p className="text-caption text-fg-tertiary">
                      Max reward {formatCurrency(idea.reward)} · max risk {formatCurrency(idea.risk)} · {idea.probability}% probability of profit.
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
};
