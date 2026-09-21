import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  variant?: 'dialog' | 'drawer';
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, icon, footer, size = 'md', children, variant = 'dialog' }) => {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key !== 'Tab' || !panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  const drawer = variant === 'drawer';

  return (
    <div className={cn('fixed inset-0 z-50 flex', drawer ? 'justify-end' : 'items-center justify-center p-4')}>
      <div className="absolute inset-0 bg-surface-inverse/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        className={cn(
          'relative flex max-h-full w-full flex-col overflow-hidden bg-surface-default shadow-elevation-3',
          drawer ? 'h-full max-w-md animate-slide-in-right' : cn('rounded-xl animate-scale-in', SIZES[size])
        )}
      >
        <header className="flex items-start gap-3 border-b border-line-subtle px-6 py-4">
          {icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-selected text-fg-link" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-title`} className="text-h3 text-fg-primary">
              {title}
            </h2>
            {description && (
              <p id={`${id}-desc`} className="text-bodyMd text-fg-tertiary">
                {description}
              </p>
            )}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-3 border-t border-line-subtle bg-surface-subtle px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
};
