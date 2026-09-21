import React, { useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDismiss } from '@/lib/hooks';
import { UNIVERSE, type SymbolInfo } from '@/lib/market';
import { useMarketStore } from '@/store/marketStore';
import { fieldStyles } from './Input';
import { PriceChange } from './PriceChange';

export interface SymbolSearchProps {
  onSelect: (symbol: SymbolInfo) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
  value?: string;
  className?: string;
  autoFocus?: boolean;
  exclude?: string[];
  'aria-label'?: string;
}

export const SymbolSearch: React.FC<SymbolSearchProps> = ({
  onSelect,
  placeholder = 'Search symbol',
  size = 'md',
  value,
  className,
  autoFocus,
  exclude = [],
  'aria-label': ariaLabel = 'Search symbol',
}) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const quotes = useMarketStore((s) => s.quotes);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    const pool = UNIVERSE.filter((s) => !exclude.includes(s.ticker));
    if (!q) return pool.slice(0, 8);
    return pool
      .filter((s) => s.ticker.startsWith(q) || s.name.toUpperCase().includes(q))
      .sort((a, b) => Number(b.ticker.startsWith(q)) - Number(a.ticker.startsWith(q)))
      .slice(0, 8);
  }, [query, exclude]);

  const choose = (s: SymbolInfo) => {
    onSelect(s);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const display = focused || !value ? query : value;

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && results[active] ? `${id}-${results[active].ticker}` : undefined}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={display}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        className={cn(fieldStyles(), 'pl-9 pr-8', size === 'sm' ? 'h-8 text-bodyMd' : 'h-9 text-bodyLg')}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-fg-tertiary hover:bg-surface-subtle hover:text-fg-primary"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label="Symbols"
          className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full min-w-72 overflow-y-auto rounded-md border border-line-default bg-surface-default py-1 shadow-elevation-2 scrollbar-thin animate-scale-in"
        >
          {results.length === 0 ? (
            <li className="px-3 py-4 text-center text-bodyMd text-fg-tertiary">No symbols match “{query}”</li>
          ) : (
            results.map((s, i) => {
              const q = quotes[s.ticker];
              return (
                <li
                  key={s.ticker}
                  id={`${id}-${s.ticker}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  className={cn('flex cursor-pointer items-center justify-between gap-3 px-3 py-2', i === active && 'bg-surface-subtle')}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="text-bodyMd font-semibold text-fg-primary">{s.ticker}</span>
                      <span className="rounded-sm bg-surface-muted px-1 text-overline font-medium normal-case tracking-normal text-fg-tertiary">{s.type}</span>
                    </span>
                    <span className="truncate text-caption text-fg-tertiary">{s.name}</span>
                  </span>
                  {q && (
                    <span className="flex flex-col items-end">
                      <span className="text-bodyMd font-medium text-fg-primary tabular">${q.price.toFixed(2)}</span>
                      <PriceChange value={q.changePct} format="percent" size="sm" />
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
