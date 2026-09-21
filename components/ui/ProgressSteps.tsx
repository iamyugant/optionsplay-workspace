import React from 'react';
import { Check } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  current: number;
  /** When set, completed steps become buttons so users can step back. */
  onStepClick?: (index: number) => void;
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, current, onStepClick, className }) => (
  <ol className={cn('flex w-full items-start', className)} aria-label="Progress">
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;
      const clickable = !!onStepClick && i < current;
      const Marker = clickable ? 'button' : 'span';
      return (
        <li key={step.id} className="relative flex flex-1 flex-col items-center gap-2 text-center" aria-current={active ? 'step' : undefined}>
          {i > 0 && (
            <span
              className={cn(
                'absolute top-4 h-px transition-colors duration-base',
                done || active ? 'bg-action-primary' : 'bg-line-default'
              )}
              style={{ left: 'calc(-50% + 20px)', right: 'calc(50% + 20px)' }}
              aria-hidden="true"
            />
          )}
          <Marker
            {...(clickable ? { type: 'button' as const, onClick: () => onStepClick(i), 'aria-label': `Go back to ${step.label}` } : {})}
            className={cn(
              'relative z-10 flex size-8 items-center justify-center rounded-full border text-bodyMd font-medium tabular transition-colors duration-base',
              done || active ? 'border-action-primary bg-action-primary text-fg-inverse' : 'border-line-strong bg-surface-default text-fg-secondary',
              clickable && ['hover:bg-action-primary-hover', focusRing]
            )}
          >
            {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
          </Marker>
          <span className={cn('text-bodyMd', active ? 'font-medium text-fg-primary' : 'text-fg-tertiary')}>{step.label}</span>
          {step.description && <span className="hidden text-caption text-fg-tertiary sm:block">{step.description}</span>}
          <span className="sr-only">{done ? '(completed)' : active ? '(current)' : '(upcoming)'}</span>
        </li>
      );
    })}
  </ol>
);
