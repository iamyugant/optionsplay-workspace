'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Plus, Zap } from 'lucide-react';
import { Badge, biasVariant } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboardStore';

const STEPS = [
  { id: 'scan', label: 'Scan' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'execute', label: 'Execute' },
];

export const TradeTicketModal: React.FC = () => {
  const ticket = useDashboardStore((s) => s.tradeTicket);
  const close = useDashboardStore((s) => s.closeTradeTicket);
  const notify = useDashboardStore((s) => s.notify);

  const [contracts, setContracts] = useState(1);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [limit, setLimit] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setContracts(1);
      setOrderType('limit');
      setLimit(+ticket.price.toFixed(2));
    }
  }, [ticket]);

  if (!ticket) return null;

  const net = limit * 100 * contracts;
  const submit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      notify(`Order sent: ${contracts} × ${ticket.symbol} ${ticket.strategy} at ${formatCurrency(limit)}`, 'success');
      close();
    }, 700);
  };

  return (
    <Modal
      open
      onClose={close}
      title="Order ticket"
      description={`${ticket.symbol} · ${ticket.strategy}`}
      icon={<Zap className="size-4" />}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} iconLeading={<Zap className="size-4" />} onClick={submit}>
            Transmit order
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <ProgressSteps steps={STEPS} current={2} />

        <section className="rounded-md bg-surface-subtle p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-h4 text-fg-primary">{ticket.symbol}</span>
            <Badge variant={biasVariant(ticket.bias)} dot>
              {ticket.bias}
            </Badge>
          </div>
          <p className="font-mono text-bodyMd text-fg-secondary">{ticket.legs}</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-bodyMd font-medium text-fg-secondary" id="order-type-label">
              Order type
            </span>
            <Tabs
              aria-label="Order type"
              activeId={orderType}
              onChange={(v) => setOrderType(v as typeof orderType)}
              items={[
                { id: 'limit', label: 'Limit' },
                { id: 'market', label: 'Market' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-bodyMd font-medium text-fg-secondary">Contracts</span>
            <div className="flex items-center gap-2">
              <IconButton label="Decrease contracts" onClick={() => setContracts((c) => Math.max(1, c - 1))}>
                <Minus className="size-4" aria-hidden="true" />
              </IconButton>
              <output className="w-10 text-center text-h4 text-fg-primary tabular" aria-live="polite">
                {contracts}
              </output>
              <IconButton label="Increase contracts" onClick={() => setContracts((c) => Math.min(50, c + 1))}>
                <Plus className="size-4" aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        </div>

        {orderType === 'limit' && (
          <Input
            label={ticket.kind === 'credit' ? 'Limit credit ($)' : 'Limit debit ($)'}
            type="number"
            step="0.05"
            min="0"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            helperText="Mid-price is pre-filled; adjust before transmitting."
          />
        )}

        <dl className="grid grid-cols-3 gap-3 rounded-md border border-line-subtle p-3 text-center">
          {(
            [
              [ticket.kind === 'credit' ? 'Net credit' : 'Net debit', formatCurrency(net), 'text-fg-bullish'],
              ['Max risk', formatCurrency(ticket.maxRisk * contracts), 'text-fg-bearish'],
              ['Probability', `${ticket.probability.toFixed(1)}%`, 'text-fg-primary'],
            ] as const
          ).map(([label, value, tone]) => (
            <div key={label}>
              <dt className="text-overline text-fg-tertiary">{label}</dt>
              <dd className={`text-h4 tabular ${tone}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-caption text-fg-tertiary">
          Simulated order routing for this prototype — nothing is sent to a broker.
        </p>
      </div>
    </Modal>
  );
};
