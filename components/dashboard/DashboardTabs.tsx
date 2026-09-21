'use client';

import React, { useState } from 'react';
import { Home, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { cn, focusRing } from '@/lib/utils';
import { getDashboardStatus, useDashboardStore } from '@/store/dashboardStore';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

export const DashboardTabs: React.FC = () => {
  const { dashboards, activeDashboardId, setActiveDashboard, createDashboard, deleteDashboard, renameDashboard } = useDashboardStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Tooltip content="Landing page">
        <Link
          href="/"
          aria-label="OptionsPlay home"
          className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-subtle', focusRing)}
        >
          <Home className="size-4" aria-hidden="true" />
        </Link>
      </Tooltip>

      <div role="tablist" aria-label="Dashboards" className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-thin">
        {dashboards.map((d) => {
          const active = d.id === activeDashboardId;
          const { hasUnsaved, isDraft } = getDashboardStatus(d);
          return (
            <div
              key={d.id}
              className={cn(
                'group/tab flex h-8 shrink-0 items-center gap-1.5 rounded-md pl-3 pr-1 transition-colors',
                active ? 'bg-surface-muted' : 'hover:bg-surface-subtle'
              )}
            >
              {renamingId === d.id ? (
                <input
                  autoFocus
                  defaultValue={d.name}
                  aria-label="Dashboard name"
                  onBlur={(e) => {
                    renameDashboard(d.id, e.target.value);
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="w-32 rounded-sm border border-line-focus bg-surface-default px-1 text-bodyMd text-fg-primary focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveDashboard(d.id)}
                  onDoubleClick={() => setRenamingId(d.id)}
                  title={`${d.name} — double-click to rename`}
                  className={cn('max-w-40 truncate rounded-sm text-bodyLg', active ? 'font-medium text-fg-primary' : 'text-fg-secondary', focusRing)}
                >
                  {d.name}
                </button>
              )}
              {active && hasUnsaved && <span className="size-1.5 shrink-0 rounded-full bg-semantic-amber-500" title="Unsaved changes" />}
              {active && !hasUnsaved && isDraft && (
                <Badge size="sm" variant="info">
                  Draft
                </Badge>
              )}
              <button
                type="button"
                aria-label={`Close ${d.name}`}
                onClick={() => deleteDashboard(d.id)}
                className={cn(
                  'flex size-5 items-center justify-center rounded-sm text-fg-tertiary opacity-0 hover:bg-surface-muted hover:text-fg-primary group-hover/tab:opacity-100',
                  active && 'opacity-100',
                  focusRing
                )}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={createDashboard}
        aria-label="New dashboard"
        title="New dashboard"
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-fg-tertiary hover:bg-surface-subtle hover:text-fg-primary', focusRing)}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};
