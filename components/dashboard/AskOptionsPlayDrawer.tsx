'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, Zap } from 'lucide-react';
import { Badge, biasVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn, formatCurrency } from '@/lib/utils';
import { findSymbol, getStrategies, getTechnicals, type StrategyIdea } from '@/lib/market';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMarketStore } from '@/store/marketStore';

interface Message {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  idea?: StrategyIdea;
}

const SUGGESTIONS = [
  'Analyze the current symbol',
  'Find a high-probability credit spread',
  'What is implied volatility rank?',
  'Suggest a hedge for my watchlist',
];

// Scripted assistant. It answers from the same mock data the widgets read, so the numbers
// it quotes always match what is on screen.
export const AskOptionsPlayDrawer: React.FC = () => {
  const open = useDashboardStore((s) => s.aiOpen);
  const setOpen = useDashboardStore((s) => s.setAiOpen);
  const activeSymbol = useDashboardStore((s) => s.activeSymbol);
  const openTradeTicket = useDashboardStore((s) => s.openTradeTicket);
  const quotes = useMarketStore((s) => s.quotes);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      from: 'assistant',
      text: 'Ask me about a symbol, a strategy or anything on your dashboard. I read the same data your widgets do.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const respond = (question: string): Message => {
    const mentioned = question.toUpperCase().match(/\b[A-Z]{1,5}\b/g)?.find((t) => findSymbol(t));
    const ticker = mentioned ?? activeSymbol;
    const quote = quotes[ticker];
    const id = `a-${Date.now()}`;

    if (/volatility|iv rank/i.test(question)) {
      const ta = getTechnicals(ticker, quote?.price ?? 100);
      return {
        id,
        from: 'assistant',
        text: `IV rank compares today's implied volatility with the past year. ${ticker} sits at ${ta.ivRank}% — ${
          ta.ivRank > 50 ? 'rich premium favours selling spreads' : 'cheaper premium favours debit strategies'
        }.`,
      };
    }

    if (/spread|strategy|hedge|trade/i.test(question)) {
      const idea = getStrategies().find((s) => s.symbol === ticker) ?? getStrategies()[0];
      return {
        id,
        from: 'assistant',
        text: `Based on ${idea.symbol}'s trend and ${idea.probability}% probability of profit, a ${idea.strategy.toLowerCase()} screens best right now:`,
        idea,
      };
    }

    const ta = getTechnicals(ticker, quote?.price ?? 100);
    return {
      id,
      from: 'assistant',
      text: `${ticker} is ${formatCurrency(quote?.price ?? 0)}, ${quote && quote.change >= 0 ? 'up' : 'down'} ${Math.abs(quote?.changePct ?? 0).toFixed(
        2
      )}% today. ${ta.summary} Technical score ${ta.technicalScore}/10 with ${ta.liquidity.label.toLowerCase()} options.`,
    };
  };

  const send = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'user', text: question }]);
    setDraft('');
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, respond(question)]);
      setThinking(false);
    }, 600);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      variant="drawer"
      title="Ask OptionsPlay"
      description="AI assistant · reads your live dashboard data"
      icon={<Sparkles className="size-4" />}
      footer={
        <form
          className="flex w-full items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <Input
            aria-label="Ask a question"
            placeholder={`Ask about ${activeSymbol}…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            containerClassName="flex-1"
            data-autofocus
          />
          <Button type="submit" variant="primary" disabled={!draft.trim()} iconLeading={<Send className="size-4" />}>
            Send
          </Button>
        </form>
      }
    >
      <div className="flex flex-col gap-4">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-2', m.from === 'user' && 'flex-row-reverse')}>
            {m.from === 'assistant' && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-selected text-fg-link" aria-hidden="true">
                <Bot className="size-4" />
              </span>
            )}
            <div className={cn('flex max-w-[85%] flex-col gap-2')}>
              <p
                className={cn(
                  'rounded-lg px-3 py-2 text-bodyMd',
                  m.from === 'user' ? 'bg-action-primary text-fg-inverse' : 'bg-surface-subtle text-fg-secondary'
                )}
              >
                <span className="sr-only">{m.from === 'user' ? 'You said: ' : 'Assistant said: '}</span>
                {m.text}
              </p>

              {m.idea && (
                <article className="flex flex-col gap-2 rounded-lg border border-line-default p-3">
                  <header className="flex items-center justify-between gap-2">
                    <span className="text-bodyLg font-semibold text-fg-primary">{m.idea.symbol}</span>
                    <Badge size="sm" variant={biasVariant(m.idea.bias)}>
                      {m.idea.bias}
                    </Badge>
                  </header>
                  <p className="text-bodyMd text-fg-secondary">{m.idea.title}</p>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    {(
                      [
                        ['Probability', `${m.idea.probability}%`],
                        ['Max reward', formatCurrency(m.idea.reward)],
                        ['Max risk', formatCurrency(m.idea.risk)],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-overline text-fg-tertiary">{k}</dt>
                        <dd className="text-bodyMd font-medium text-fg-primary tabular">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    iconLeading={<Zap className="size-3.5" />}
                    onClick={() => {
                      const idea = m.idea!;
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
                      });
                      setOpen(false);
                    }}
                  >
                    Open order ticket
                  </Button>
                </article>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <p className="flex items-center gap-2 text-bodyMd text-fg-tertiary" aria-live="polite">
            <Bot className="size-4 animate-pulse" aria-hidden="true" /> Analyzing {activeSymbol}…
          </p>
        )}

        {messages.length <= 1 && (
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Button variant="secondary" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div ref={endRef} />
      </div>
    </Modal>
  );
};
