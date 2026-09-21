'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export const DsSection: React.FC<{ id: string; title: string; intro?: string; children: React.ReactNode }> = ({ id, title, intro, children }) => (
  <section id={id} className="scroll-mt-20 border-t border-line-subtle pt-10">
    <h2 className="text-h1 text-fg-primary">{title}</h2>
    {intro && <p className="mt-2 max-w-3xl text-h4 font-normal text-fg-secondary">{intro}</p>}
    <div className="mt-6 flex flex-col gap-8">{children}</div>
  </section>
);

export const Specimen: React.FC<{ title: string; description?: string; className?: string; children: React.ReactNode; aside?: React.ReactNode }> = ({
  title,
  description,
  className,
  children,
  aside,
}) => (
  <article className={cn('rounded-lg border border-line-subtle bg-surface-default', className)}>
    <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-subtle px-4 py-3">
      <div>
        <h3 className="text-h4 text-fg-primary">{title}</h3>
        {description && <p className="text-bodyMd text-fg-tertiary">{description}</p>}
      </div>
      {aside}
    </header>
    <div className="p-4">{children}</div>
  </article>
);

export const StateGrid: React.FC<{ states: string[]; rows: { label: string; render: (state: string) => React.ReactNode }[] }> = ({ states, rows }) => (
  <div className="overflow-x-auto scrollbar-thin">
    <table className="w-full min-w-96 border-collapse">
      <thead>
        <tr>
          <th scope="col" className="w-24 px-2 pb-2 text-left text-caption font-medium text-fg-tertiary">
            Variant
          </th>
          {states.map((s) => (
            <th key={s} scope="col" className="px-2 pb-2 text-left text-caption font-medium text-fg-tertiary">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="px-2 py-2 text-left text-bodyMd font-normal text-fg-secondary">
              {row.label}
            </th>
            {states.map((s) => (
              <td key={s} className="px-2 py-2">
                {row.render(s)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CopyChip: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-surface-subtle px-1.5 py-0.5 font-mono text-caption text-fg-secondary hover:bg-surface-muted',
        focusRing,
        className
      )}
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="size-3 text-fg-bullish" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
      {value}
    </button>
  );
};

export const DoDont: React.FC<{ tone: 'do' | 'dont'; title: string; items: string[] }> = ({ tone, title, items }) => (
  <div className={cn('rounded-lg border-l-4 bg-surface-default p-4', tone === 'do' ? 'border-semantic-success-600' : 'border-semantic-red-600')}>
    <h4 className={cn('mb-2 text-h4', tone === 'do' ? 'text-fg-bullish' : 'text-fg-bearish')}>{title}</h4>
    <ul className="flex list-disc flex-col gap-1 pl-4 text-bodyMd text-fg-secondary">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  </div>
);
