import React from 'react';
import { cn } from '@/lib/utils';

const scoreTone = (score: number) => (score >= 60 ? 'high' : score >= 40 ? 'mid' : 'low');

const TONES = {
  high: 'bg-semantic-success-600 text-fg-inverse',
  mid: 'bg-semantic-amber-400 text-fg-primary',
  low: 'bg-semantic-red-600 text-fg-inverse',
};

export const ScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md'; className?: string }> = ({ score, size = 'md', className }) => (
  <span
    role="img"
    aria-label={`Score ${score} out of 100`}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tabular',
      size === 'sm' ? 'size-6 text-overline' : 'size-7 text-caption font-semibold',
      TONES[scoreTone(score)],
      className
    )}
  >
    {score}
  </span>
);
