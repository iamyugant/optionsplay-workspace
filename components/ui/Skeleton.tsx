import React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div aria-hidden="true" className={cn('animate-pulse rounded-sm bg-surface-muted', className)} {...props} />
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => (
  <div role="status" aria-label="Loading" className="flex flex-col">
    <div className="flex gap-4 border-b border-line-subtle px-3 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex h-10 items-center gap-4 border-b border-line-subtle px-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className={cn('h-3', c === 0 ? 'w-12' : 'flex-1')} />
        ))}
      </div>
    ))}
  </div>
);

export const WidgetSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading" className="flex flex-col gap-3 p-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
    </div>
    <Skeleton className="h-24" />
  </div>
);
