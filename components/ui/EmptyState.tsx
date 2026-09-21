import React from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, compact, className }) => (
  <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-1 px-4 py-8' : 'gap-2 px-6 py-12', className)}>
    <span
      className={cn('mb-1 flex items-center justify-center rounded-full bg-surface-subtle text-fg-tertiary', compact ? 'size-10' : 'size-12')}
      aria-hidden="true"
    >
      {icon ?? <SearchX className="size-5" />}
    </span>
    <p className="text-h4 text-fg-primary">{title}</p>
    {description && <p className="max-w-xs text-bodyMd text-fg-tertiary">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
