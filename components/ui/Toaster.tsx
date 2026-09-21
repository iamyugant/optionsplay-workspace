import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { cn, focusRing } from '@/lib/utils';

const ICONS = {
  success: <CheckCircle2 className="size-4 text-semantic-success-400" aria-hidden="true" />,
  info: <Info className="size-4 text-brand-blue-300" aria-hidden="true" />,
  warning: <AlertTriangle className="size-4 text-semantic-amber-400" aria-hidden="true" />,
};

export const Toaster: React.FC = () => {
  const toasts = useDashboardStore((s) => s.toasts);
  const dismiss = useDashboardStore((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-lg bg-surface-inverse py-2.5 pl-4 pr-2 text-bodyMd text-fg-inverse shadow-elevation-3 animate-slide-up"
        >
          {ICONS[t.tone]}
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.run();
                dismiss(t.id);
              }}
              className={cn('rounded-sm px-2 py-1 font-medium text-brand-blue-200 hover:text-fg-inverse', focusRing)}
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismiss(t.id)}
            className={cn('flex size-6 items-center justify-center rounded-sm text-semantic-neutral-400 hover:text-fg-inverse', focusRing)}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
};
