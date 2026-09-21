import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export type DayStatus = 'hit' | 'loss' | 'missed' | 'pending';

export interface CalendarProps {
  statuses?: Record<string, DayStatus>;
  selected?: string | null;
  onSelect?: (isoDate: string) => void;
  initialMonth?: Date;
  title?: string;
  className?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const STATUS_META: Record<DayStatus, { label: string; className: string; icon: React.ReactNode }> = {
  hit: { label: 'Target hit', className: 'bg-semantic-success-600 text-fg-inverse', icon: <Check className="size-3" strokeWidth={3} /> },
  loss: { label: 'Stopped out', className: 'bg-semantic-red-600 text-fg-inverse', icon: <X className="size-3" strokeWidth={3} /> },
  missed: { label: 'No trade', className: 'border-2 border-semantic-red-500 bg-surface-default', icon: null },
  pending: { label: 'Open position', className: 'bg-semantic-amber-400 text-fg-primary', icon: <HelpCircle className="size-3" strokeWidth={3} /> },
};

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const Calendar: React.FC<CalendarProps> = ({ statuses = {}, selected, onSelect, initialMonth, title = 'Calendar', className }) => {
  const [month, setMonth] = useState(() => {
    const d = initialMonth ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const days = useMemo(() => {
    const offset = (month.getDay() + 6) % 7; // Monday-first
    const start = new Date(month);
    start.setDate(1 - offset);
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const shift = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const cells = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-day]'));
    const idx = cells.indexOf(document.activeElement as HTMLButtonElement);
    cells[Math.min(cells.length - 1, Math.max(0, idx + step))]?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-h4 text-fg-primary">{title}</h3>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-bodyMd text-fg-secondary" aria-live="polite">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className={cn('flex size-7 items-center justify-center rounded-md text-fg-tertiary hover:bg-surface-subtle', focusRing)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className={cn('flex size-7 items-center justify-center rounded-md text-fg-tertiary hover:bg-surface-subtle', focusRing)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div role="grid" aria-label={title} onKeyDown={onKeyDown} className="grid grid-cols-7 gap-y-2">
        {WEEKDAYS.map((d) => (
          <div key={d} role="columnheader" className="pb-1 text-center text-bodyMd font-medium text-fg-primary">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === month.getMonth();
          const status = statuses[iso];
          const meta = status ? STATUS_META[status] : null;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              data-day
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${meta ? `, ${meta.label}` : ''}`}
              tabIndex={isSelected || (!selected && d.getDate() === 1 && inMonth) ? 0 : -1}
              onClick={() => onSelect?.(iso)}
              className={cn(
                'mx-auto flex w-10 flex-col items-center gap-1 rounded-md py-1 transition-colors duration-fast',
                focusRing,
                isSelected ? 'bg-surface-selected' : 'hover:bg-surface-subtle'
              )}
            >
              <span className={cn('text-bodyMd tabular', inMonth ? 'text-fg-primary' : 'text-fg-disabled')}>{d.getDate()}</span>
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  meta ? meta.className : 'border-2 border-line-subtle',
                  !inMonth && 'opacity-50'
                )}
                aria-hidden="true"
              >
                {meta?.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
