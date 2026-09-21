import React, { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { useDismiss } from '@/lib/hooks';
import { fieldStyles } from './Input';

export interface DropdownOption<V extends string = string> {
  label: string;
  value: V;
  description?: string;
  icon?: React.ReactNode;
}

export interface DropdownProps<V extends string = string> {
  label?: string;
  options: DropdownOption<V>[];
  value: V | '';
  onChange: (value: V) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function Dropdown<V extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Dropdown',
  size = 'md',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: DropdownProps<V>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (i: number) => {
    const opt = options[i];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(options.length - 1, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(options.length - 1),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Tab: () => setOpen(false),
    };
    if (moves[e.key]) {
      if (e.key !== 'Tab') e.preventDefault();
      moves[e.key]();
    }
  };

  return (
    <div ref={ref} className={cn('relative flex flex-col gap-1', className)}>
      {label && (
        <span id={`${id}-label`} className="text-bodyMd font-medium text-fg-secondary">
          {label}
        </span>
      )}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          fieldStyles({ disabled }),
          'flex items-center justify-between gap-2 px-3 text-left',
          size === 'sm' ? 'h-8 text-bodyMd' : 'h-9 text-bodyLg',
          open && 'border-line-focus ring-2 ring-brand-blue-100'
        )}
      >
        <span className={cn('flex min-w-0 items-center gap-2 truncate', !selected && 'text-fg-disabled')}>
          {selected?.icon}
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-fg-tertiary transition-transform duration-fast', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
          className="absolute left-0 top-full z-50 mt-1 max-h-72 min-w-full overflow-y-auto rounded-md border border-line-default bg-surface-default py-1 shadow-elevation-2 scrollbar-thin animate-scale-in"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-bodyMd',
                  i === active && 'bg-surface-subtle',
                  isSelected ? 'font-medium text-fg-link' : 'text-fg-primary'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {opt.icon}
                  <span className="flex flex-col">
                    <span className="truncate">{opt.label}</span>
                    {opt.description && <span className="text-caption text-fg-tertiary">{opt.description}</span>}
                  </span>
                </span>
                {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export const Menu: React.FC<{
  trigger: (props: { open: boolean; toggle: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' }) => React.ReactNode;
  items: (MenuItem | 'divider')[];
  align?: 'start' | 'end';
  className?: string;
}> = ({ trigger, items, align = 'end', className }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger({ open, toggle: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-1 min-w-48 rounded-md border border-line-default bg-surface-default py-1 shadow-elevation-2 animate-scale-in',
            align === 'end' ? 'right-0' : 'left-0'
          )}
          onKeyDown={(e) => {
            const els = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
            const idx = els.indexOf(document.activeElement as HTMLButtonElement);
            if (e.key === 'ArrowDown') els[(idx + 1) % els.length]?.focus();
            if (e.key === 'ArrowUp') els[(idx - 1 + els.length) % els.length]?.focus();
          }}
        >
          {items.map((item, i) =>
            item === 'divider' ? (
              <div key={`d-${i}`} role="separator" className="my-1 h-px bg-line-subtle" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-bodyMd transition-colors duration-fast',
                  'focus:bg-surface-subtle focus:outline-none disabled:cursor-not-allowed disabled:text-fg-disabled',
                  item.danger ? 'text-fg-bearish hover:bg-semantic-red-50' : 'text-fg-primary hover:bg-surface-subtle',
                  focusRing
                )}
              >
                {item.icon && <span className="flex size-4 items-center justify-center text-fg-tertiary" aria-hidden="true">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <kbd className="font-sans text-caption text-fg-disabled">{item.shortcut}</kbd>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
