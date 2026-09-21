import React, { forwardRef, useId } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  onClear?: () => void;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const SIZES = { sm: 'h-8 text-bodyMd', md: 'h-9 text-bodyLg', lg: 'h-11 text-bodyLg' };

export const fieldStyles = (opts: { error?: boolean; disabled?: boolean } = {}) =>
  cn(
    'w-full rounded-md border bg-surface-default text-fg-primary placeholder:text-fg-disabled',
    'transition-[border-color,box-shadow] duration-fast ease-standard',
    'focus:outline-none focus:ring-2',
    opts.error
      ? 'border-semantic-red-600 focus:ring-semantic-red-100'
      : 'border-line-default hover:border-line-strong focus:border-line-focus focus:ring-brand-blue-100',
    opts.disabled && 'cursor-not-allowed border-line-subtle bg-surface-subtle text-fg-disabled hover:border-line-subtle'
  );

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName, label, helperText, error, iconLeading, iconTrailing, onClear, size = 'md', disabled, type = 'text', value, id, ...props },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const leading = iconLeading ?? (type === 'search' ? <Search className="size-4" /> : null);
    const showClear = !!onClear && !!value && !disabled;
    const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('flex w-full flex-col gap-1', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-bodyMd font-medium text-fg-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leading && (
            <span className="pointer-events-none absolute left-3 flex text-fg-tertiary" aria-hidden="true">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              fieldStyles({ error: !!error, disabled }),
              SIZES[size],
              leading ? 'pl-9' : 'pl-3',
              showClear || iconTrailing ? 'pr-9' : 'pr-3',
              '[&::-webkit-search-cancel-button]:hidden',
              className
            )}
            {...props}
          />
          {showClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear"
              className="absolute right-2 flex size-6 items-center justify-center rounded-sm text-fg-tertiary hover:bg-surface-subtle hover:text-fg-primary"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            iconTrailing && (
              <span className="pointer-events-none absolute right-3 flex text-fg-tertiary" aria-hidden="true">
                {iconTrailing}
              </span>
            )
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-caption text-fg-bearish">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={`${inputId}-helper`} className="text-caption text-fg-tertiary">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
