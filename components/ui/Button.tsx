import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'brand';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-action-primary text-fg-inverse hover:bg-action-primary-hover active:bg-action-primary-pressed disabled:bg-action-disabled disabled:text-fg-disabled',
  secondary:
    'bg-surface-default text-fg-link border border-brand-blue-600 hover:bg-brand-blue-50 active:bg-brand-blue-100 active:border-brand-blue-700 disabled:bg-surface-default disabled:border-line-subtle disabled:text-fg-disabled',
  tertiary:
    'bg-transparent text-fg-link hover:text-brand-blue-800 hover:bg-brand-blue-50 active:text-brand-blue-900 disabled:bg-transparent disabled:text-brand-blue-200',
  danger:
    'bg-semantic-red-600 text-fg-inverse hover:bg-semantic-red-700 active:bg-semantic-red-800 disabled:bg-action-disabled disabled:text-fg-disabled',
  ghost:
    'bg-transparent text-fg-secondary hover:bg-surface-subtle hover:text-fg-primary active:bg-surface-muted disabled:bg-transparent disabled:text-fg-disabled',
  brand:
    'bg-brand-green-500 text-fg-primary hover:bg-brand-green-400 active:bg-brand-green-600 disabled:bg-action-disabled disabled:text-fg-disabled',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5 text-bodyMd',
  md: 'h-9 px-4 gap-2 text-bodyLg',
  lg: 'h-11 px-5 gap-2 text-h4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      children,
      iconLeading,
      iconTrailing,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium',
        'transition-colors duration-fast ease-standard disabled:cursor-not-allowed',
        focusRing,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} aria-hidden="true" />
      ) : (
        iconLeading && <span className="inline-flex" aria-hidden="true">{iconLeading}</span>
      )}
      {children}
      {!loading && iconTrailing && <span className="inline-flex" aria-hidden="true">{iconTrailing}</span>}
    </button>
  )
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon-only buttons have no text, so a label is mandatory. */
  label: string;
  size?: 'xs' | 'sm' | 'md';
  active?: boolean;
  tone?: 'default' | 'danger';
}

const ICON_SIZES = { xs: 'size-6', sm: 'size-8', md: 'size-9' };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'sm', active = false, tone = 'default', className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-fast ease-standard',
        'disabled:cursor-not-allowed disabled:opacity-40',
        focusRing,
        ICON_SIZES[size],
        tone === 'default' &&
          (active
            ? 'bg-surface-selected text-fg-link'
            : 'text-fg-tertiary hover:bg-surface-subtle hover:text-fg-primary active:bg-surface-muted'),
        tone === 'danger' && 'text-fg-tertiary hover:bg-semantic-red-50 hover:text-fg-bearish',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';
