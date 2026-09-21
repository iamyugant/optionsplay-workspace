import React, { useRef } from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface TabItem<V extends string = string> {
  id: V;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<V extends string = string> {
  items: TabItem<V>[];
  activeId: V;
  onChange: (id: V) => void;
  variant?: 'segmented' | 'underline';
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

export function Tabs<V extends string = string>({
  items,
  activeId,
  onChange,
  variant = 'segmented',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: TabsProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full items-center overflow-x-auto scrollbar-thin',
        variant === 'segmented' && 'rounded-md border border-line-default bg-surface-default',
        variant === 'underline' && 'gap-6 border-b border-line-subtle',
        className
      )}
    >
      {items.map((tab, i) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-colors duration-fast ease-standard',
              focusRing,
              size === 'sm' ? 'text-caption' : 'text-bodyMd',
              variant === 'segmented' && [
                size === 'sm' ? 'h-7 px-2.5' : 'h-8 px-3',
                'border-l border-line-default first:rounded-l-[7px] first:border-l-0 last:rounded-r-[7px]',
                active ? 'bg-action-primary text-fg-inverse' : 'text-fg-secondary hover:bg-surface-subtle hover:text-fg-primary',
              ],
              variant === 'underline' && [
                '-mb-px border-b-2 py-2',
                active ? 'border-action-primary text-fg-link' : 'border-transparent text-fg-tertiary hover:text-fg-primary',
              ],
            )}
          >
            {tab.icon && <span className="flex" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {typeof tab.count === 'number' && <span className="tabular">({tab.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
