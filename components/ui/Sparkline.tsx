import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'bullish' | 'bearish' | 'neutral' | 'auto';
  fill?: boolean;
  className?: string;
}

const STROKE = {
  bullish: 'var(--semantic-success-600)',
  bearish: 'var(--semantic-red-600)',
  neutral: 'var(--brand-blue-600)',
};

export const Sparkline: React.FC<SparklineProps> = ({ data, width = 80, height = 24, tone = 'auto', fill = true, className }) => {
  const id = useId();
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => [(i / (data.length - 1)) * width, height - 2 - ((v - min) / range) * (height - 4)]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const resolved = tone === 'auto' ? (data[data.length - 1] >= data[0] ? 'bullish' : 'bearish') : tone;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn('shrink-0 overflow-visible', className)} aria-hidden="true">
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={STROKE[resolved]} stopOpacity="0.18" />
              <stop offset="100%" stopColor={STROKE[resolved]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={STROKE[resolved]} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
