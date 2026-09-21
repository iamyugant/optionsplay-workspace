'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { WidgetShell, type WidgetProps } from './WidgetShell';
import { Badge } from '@/components/ui/Badge';
import { Calendar, STATUS_META, toISODate, type DayStatus } from '@/components/ui/Calendar';
import { seededRandom } from '@/lib/utils';

function journalOutcomes(): Record<string, DayStatus> {
  const rnd = seededRandom('dailyplay-journal');
  const today = new Date();
  const out: Record<string, DayStatus> = {};
  for (let i = 0; i < 45; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const r = rnd();
    out[toISODate(d)] = i === 0 ? 'pending' : r > 0.72 ? 'loss' : r > 0.6 ? 'missed' : r > 0.15 ? 'hit' : 'pending';
  }
  return out;
}

export const TradingCalendarWidget: React.FC<WidgetProps> = ({ shell }) => {
  const statuses = useMemo(journalOutcomes, []);
  const [selected, setSelected] = useState<string | null>(null);

  const totals = useMemo(() => {
    const values = Object.values(statuses);
    const hit = values.filter((v) => v === 'hit').length;
    const loss = values.filter((v) => v === 'loss').length;
    return { hit, loss, open: values.filter((v) => v === 'pending').length, winRate: hit + loss ? Math.round((hit / (hit + loss)) * 100) : 0 };
  }, [statuses]);

  const selectedStatus = selected ? statuses[selected] : undefined;

  return (
    <WidgetShell
      {...shell}
      title="DailyPlay Journal"
      icon={<CalendarDays className="size-4" />}
      info="Outcome of every DailyPlay alert. Select a day to see its result."
      footer={
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {(Object.keys(STATUS_META) as DayStatus[]).map((key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`flex size-3 items-center justify-center rounded-full ${STATUS_META[key].className}`} aria-hidden="true" />
              {STATUS_META[key].label}
            </span>
          ))}
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['Win rate', `${totals.winRate}%`, 'text-fg-bullish'],
              ['Targets hit', String(totals.hit), 'text-fg-primary'],
              ['Open', String(totals.open), 'text-fg-warning'],
            ] as const
          ).map(([label, value, tone]) => (
            <div key={label} className="rounded-md border border-line-subtle p-2 text-center">
              <p className="text-overline text-fg-tertiary">{label}</p>
              <p className={`text-h3 tabular ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        <Calendar title="This month" statuses={statuses} selected={selected} onSelect={setSelected} />

        {selected && (
          <div className="flex items-center justify-between gap-2 rounded-md bg-surface-subtle p-3">
            <span className="text-bodyMd text-fg-secondary">
              {new Date(`${selected}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            {selectedStatus ? (
              <Badge variant={selectedStatus === 'hit' ? 'bullish' : selectedStatus === 'loss' ? 'bearish' : selectedStatus === 'pending' ? 'warning' : 'neutral'}>
                {STATUS_META[selectedStatus].label}
              </Badge>
            ) : (
              <Badge variant="neutral">No alert</Badge>
            )}
          </div>
        )}
      </div>
    </WidgetShell>
  );
};
