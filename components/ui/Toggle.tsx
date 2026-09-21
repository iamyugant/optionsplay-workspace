import React, { useId } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  loading = false,
  label,
  description,
  className,
}) => {
  const id = useId();
  const sm = size === 'sm';
  const inert = disabled || loading;

  return (
    <div className={cn('inline-flex items-start gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={inert}
        onClick={() => onChange(!checked)}
        className={cn(
          'group relative inline-flex shrink-0 items-center rounded-full transition-colors duration-base ease-standard',
          focusRing,
          sm ? 'h-4 w-7' : 'h-5 w-9',
          checked ? 'bg-action-primary active:bg-action-primary-pressed' : 'bg-semantic-neutral-400 active:bg-semantic-neutral-500',
          inert && 'cursor-not-allowed',
          disabled && (checked ? 'bg-brand-blue-200' : 'bg-surface-muted')
        )}
      >
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-white shadow-elevation-1 transition-transform duration-base ease-standard',
            'group-active:scale-95',
            sm ? 'size-3' : 'size-4',
            checked ? (sm ? 'translate-x-3.5' : 'translate-x-[18px]') : 'translate-x-0.5'
          )}
        >
          {loading && <Loader2 className={cn('animate-spin text-fg-link', sm ? 'size-2' : 'size-3')} aria-hidden="true" />}
        </span>
      </button>
      {label && (
        <span className="flex flex-col">
          <label htmlFor={id} className={cn('text-bodyLg', disabled ? 'text-fg-disabled' : 'text-fg-primary', !inert && 'cursor-pointer')}>
            {label}
          </label>
          {description && (
            <span id={`${id}-desc`} className="text-caption text-fg-tertiary">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
