import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'bullish' | 'success' | 'bearish' | 'warning' | 'hot' | 'neutral' | 'info' | 'new' | 'brand';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Compact uppercase form, for use inside tables. */
  size?: 'sm' | 'md';
  dot?: boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  bullish: 'bg-semantic-success-100 text-semantic-success-800',
  success: 'bg-semantic-success-100 text-semantic-success-800',
  bearish: 'bg-semantic-red-100 text-semantic-red-800',
  warning: 'bg-semantic-amber-100 text-semantic-amber-800',
  hot: 'bg-semantic-amber-100 text-semantic-amber-800',
  neutral: 'bg-surface-muted text-fg-secondary',
  info: 'bg-brand-blue-100 text-brand-blue-700',
  new: 'bg-brand-blue-100 text-brand-blue-700',
  brand: 'bg-brand-green-100 text-brand-green-800',
};

const DOTS: Record<BadgeVariant, string> = {
  bullish: 'bg-semantic-success-600',
  success: 'bg-semantic-success-600',
  bearish: 'bg-semantic-red-600',
  warning: 'bg-semantic-amber-500',
  hot: 'bg-semantic-amber-500',
  neutral: 'bg-semantic-neutral-500',
  info: 'bg-brand-blue-600',
  new: 'bg-brand-blue-600',
  brand: 'bg-brand-green-600',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', size = 'md', dot = false, children, ...props }) => (
  <span
    className={cn(
      'inline-flex shrink-0 select-none items-center gap-1 whitespace-nowrap rounded-sm',
      size === 'sm' ? 'px-1.5 py-0.5 text-overline uppercase' : 'px-2 py-0.5 text-caption font-medium',
      VARIANTS[variant],
      className
    )}
    {...props}
  >
    {dot && <span className={cn('size-1.5 rounded-full', DOTS[variant])} aria-hidden="true" />}
    {children}
  </span>
);

export const biasVariant = (bias: string): BadgeVariant =>
  /bull/i.test(bias) ? 'bullish' : /bear/i.test(bias) ? 'bearish' : 'neutral';
