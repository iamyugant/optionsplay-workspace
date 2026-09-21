import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Direction is carried by the sign and the arrow as well as the color (WCAG 1.4.1).
export const PriceChange: React.FC<{
  value: number;
  percent?: number;
  format?: 'currency' | 'percent' | 'number';
  size?: 'sm' | 'md';
  icon?: boolean;
  className?: string;
}> = ({ value, percent, format = 'currency', size = 'md', icon = false, className }) => {
  const up = value >= 0;
  const sign = up ? '+' : '−';
  const abs = Math.abs(value);
  const text = format === 'currency' ? `${sign}$${abs.toFixed(2)}` : format === 'percent' ? `${sign}${abs.toFixed(2)}%` : `${sign}${abs.toFixed(2)}`;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium tabular',
        size === 'sm' ? 'text-caption' : 'text-bodyMd',
        up ? 'text-fg-bullish' : 'text-fg-bearish',
        className
      )}
    >
      {icon && <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden="true" />}
      {text}
      {percent !== undefined && <span>({`${sign}${Math.abs(percent).toFixed(2)}%`})</span>}
    </span>
  );
};
