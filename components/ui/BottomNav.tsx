import React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: boolean;
  onSelect: () => void;
}

export const BottomNav: React.FC<{ items: BottomNavItem[]; activeId: string; className?: string }> = ({ items, activeId, className }) => (
  <nav
    aria-label="Primary"
    className={cn('flex items-stretch justify-around border-t border-line-subtle bg-surface-default pb-[env(safe-area-inset-bottom)]', className)}
  >
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          onClick={item.onSelect}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'relative flex min-h-touch min-w-touch flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-fast',
            'active:bg-surface-muted',
            focusRing,
            active ? 'text-fg-primary' : 'text-fg-tertiary'
          )}
        >
          <span
            className={cn('absolute top-0 h-0.5 w-8 rounded-full transition-colors duration-base', active ? 'bg-semantic-amber-400' : 'bg-transparent')}
            aria-hidden="true"
          />
          <span className="relative flex" aria-hidden="true">
            {item.icon}
            {item.badge && <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-semantic-red-600 ring-2 ring-surface-default" />}
          </span>
          <span className="text-overline normal-case tracking-normal">{item.label}</span>
          {item.badge && <span className="sr-only">(new notifications)</span>}
        </button>
      );
    })}
  </nav>
);
