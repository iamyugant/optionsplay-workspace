'use client';

import React, { useMemo, useState } from 'react';
import { PanelLeftClose, Plus } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/Button';
import { useDashboardStore } from '@/store/dashboardStore';
import { WIDGET_REGISTRY } from '@/components/widgets/registry';

export const WidgetLibrary: React.FC = () => {
  const addWidget = useDashboardStore((s) => s.addWidget);
  const setLibraryOpen = useDashboardStore((s) => s.setLibraryOpen);
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = WIDGET_REGISTRY.filter((w) => !q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    return matches.reduce<Record<string, typeof WIDGET_REGISTRY>>((acc, w) => {
      (acc[w.category] ??= []).push(w);
      return acc;
    }, {});
  }, [query]);

  return (
    <aside aria-label="Widget library" className="flex w-60 shrink-0 flex-col gap-3 rounded-lg border border-line-subtle bg-surface-default p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 text-fg-primary">Widgets</h2>
        <IconButton label="Hide widget library" size="xs" onClick={() => setLibraryOpen(false)}>
          <PanelLeftClose className="size-4" aria-hidden="true" />
        </IconButton>
      </div>

      <Input
        type="search"
        size="sm"
        placeholder="Search widgets"
        aria-label="Search widgets"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto scrollbar-thin">
        {Object.entries(groups).map(([category, widgets]) => (
          <section key={category} className="flex flex-col gap-2">
            <h3 className="text-overline text-fg-tertiary">{category}</h3>
            {widgets.map((w) => (
              <button
                key={w.type}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-widget-type', w.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => addWidget(w.type)}
                className={cn(
                  'group flex cursor-grab flex-col gap-1 rounded-md border border-line-subtle p-2.5 text-left transition-colors',
                  'hover:border-brand-blue-600 hover:bg-surface-selected active:cursor-grabbing',
                  focusRing
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-sm bg-surface-subtle text-fg-link" aria-hidden="true">
                    {w.icon}
                  </span>
                  <span className="flex-1 text-bodyLg font-medium text-fg-primary">{w.name}</span>
                  <Plus className="size-3.5 text-fg-tertiary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </span>
                <span className="text-caption text-fg-tertiary">{w.description}</span>
              </button>
            ))}
          </section>
        ))}
        {Object.keys(groups).length === 0 && <p className="px-1 text-bodyMd text-fg-tertiary">No widgets match “{query}”.</p>}
      </div>

      <p className="text-caption text-fg-tertiary">Drag a card onto the canvas, or click to append it.</p>
    </aside>
  );
};
