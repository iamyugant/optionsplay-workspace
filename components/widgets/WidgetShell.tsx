'use client';

import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Info, Lock, MoreHorizontal, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { EmptyState } from '@/components/ui/EmptyState';
import { WidgetSkeleton } from '@/components/ui/Skeleton';
import { GRID_UNIT, MAX_HEIGHT, MIN_HEIGHT, snapHeight, type ColSpan, type WidgetInstance } from '@/store/dashboardStore';

export interface WidgetShellProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  info?: string;
  headerAside?: React.ReactNode;
  controlBar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;

  colSpan?: ColSpan;
  height?: number;
  collapsed?: boolean;
  editing?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onResizeStart?: () => void;
  onResize?: (patch: { colSpan?: ColSpan; height?: number }) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;

  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  locked?: boolean;
  className?: string;
  bodyClassName?: string;
}

// Every widget renders through this shell: header, control bar, body and footer, plus the
// five body states and — in edit mode — drag, 1–4 column resize and 8pt height resize.
export const WidgetShell: React.FC<WidgetShellProps> = ({
  id,
  title,
  icon,
  info,
  headerAside,
  controlBar,
  footer,
  children,
  colSpan = 1,
  height,
  collapsed = false,
  editing = false,
  selected = false,
  onSelect,
  onToggleCollapse,
  onRemove,
  onDuplicate,
  onResizeStart,
  onResize,
  dragHandleProps,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyTitle = 'Nothing to show yet',
  emptyDescription = 'Adjust the filters above to see results.',
  emptyAction,
  locked = false,
  className,
  bodyClassName,
}) => {
  const rootRef = useRef<HTMLElement>(null);
  const [resizing, setResizing] = useState<null | 'width' | 'height' | 'corner'>(null);

  const startResize = (mode: 'width' | 'height' | 'corner') => (e: React.PointerEvent) => {
    if (!editing || !onResize) return;
    e.preventDefault();
    e.stopPropagation();
    onResizeStart?.();
    setResizing(mode);
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startSpan = colSpan;
    const startHeight = height ?? rootRef.current?.offsetHeight ?? 480;
    const colWidth = (rootRef.current?.parentElement?.offsetWidth ?? 1200) / colSpan;

    const move = (ev: PointerEvent) => {
      const patch: { colSpan?: ColSpan; height?: number } = {};
      if (mode !== 'height') {
        const delta = Math.round((ev.clientX - startX) / colWidth);
        patch.colSpan = Math.min(4, Math.max(1, startSpan + delta)) as ColSpan;
      }
      if (mode !== 'width') patch.height = snapHeight(startHeight + (ev.clientY - startY));
      onResize(patch);
    };
    const up = () => {
      setResizing(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Alt + arrows resize without a pointer.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!editing || !onResize || !e.altKey) return;
    const map: Record<string, () => void> = {
      ArrowRight: () => onResize({ colSpan: Math.min(4, colSpan + 1) as ColSpan }),
      ArrowLeft: () => onResize({ colSpan: Math.max(1, colSpan - 1) as ColSpan }),
      ArrowDown: () => onResize({ height: snapHeight((height ?? 480) + GRID_UNIT * 4) }),
      ArrowUp: () => onResize({ height: snapHeight((height ?? 480) - GRID_UNIT * 4) }),
    };
    if (map[e.key]) {
      e.preventDefault();
      onResizeStart?.();
      map[e.key]();
    }
  };

  const body = () => {
    if (loading) return <WidgetSkeleton />;
    if (error)
      return (
        <EmptyState
          icon={<TriangleAlert className="size-5 text-fg-bearish" />}
          title="Couldn’t load data"
          description={error}
          action={
            onRetry && (
              <Button variant="secondary" size="sm" iconLeading={<RefreshCw className="size-3.5" />} onClick={onRetry}>
                Retry
              </Button>
            )
          }
        />
      );
    if (locked)
      return (
        <EmptyState
          icon={<Lock className="size-5 text-fg-link" />}
          title="Included with OptionsPlay Pro"
          description="Unlock scenario simulation, risk scoring and unlimited screeners."
          action={
            <Button variant="primary" size="sm">
              Upgrade to Pro
            </Button>
          }
        />
      );
    if (empty) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
    return children;
  };

  return (
    <section
      id={id}
      ref={rootRef}
      aria-label={title}
      onKeyDown={onKeyDown}
      onPointerDownCapture={editing ? onSelect : undefined}
      style={{ height: collapsed ? undefined : height }}
      className={cn(
        'group/widget relative flex min-h-0 flex-col overflow-hidden rounded-lg border bg-surface-default',
        'transition-shadow duration-fast',
        selected && editing ? 'border-brand-blue-600 ring-2 ring-brand-blue-100' : 'border-line-subtle',
        editing && 'cursor-default hover:border-line-strong',
        resizing && 'shadow-elevation-2',
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line-subtle px-4 py-2.5">
        {editing && (
          <div
            {...dragHandleProps}
            className={cn('-ml-1.5 flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-fg-disabled hover:bg-surface-subtle hover:text-fg-secondary active:cursor-grabbing', focusRing)}
            aria-label={`Reorder ${title}`}
            title="Drag to reorder"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </div>
        )}
        {icon && (
          <span className="flex size-5 shrink-0 items-center justify-center text-fg-tertiary" aria-hidden="true">
            {icon}
          </span>
        )}
        <h2 className="truncate text-h4 text-fg-primary">{title}</h2>
        {info && (
          <Tooltip content={info}>
            <button type="button" aria-label={`About ${title}`} className={cn('flex size-5 items-center justify-center rounded-full text-fg-disabled hover:text-fg-secondary', focusRing)}>
              <Info className="size-3.5" aria-hidden="true" />
            </button>
          </Tooltip>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {headerAside}
          {(onDuplicate || onRemove) && (
            <Menu
              items={[
                ...(onDuplicate ? [{ label: 'Duplicate widget', icon: <Copy className="size-3.5" />, onSelect: onDuplicate }] : []),
                ...(onRemove ? (['divider', { label: 'Remove widget', icon: <Trash2 className="size-3.5" />, danger: true, onSelect: onRemove }] as const) : []),
              ]}
              trigger={({ toggle, ...aria }) => (
                <IconButton label={`${title} options`} size="xs" onClick={toggle} {...aria}>
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </IconButton>
              )}
            />
          )}
          {onToggleCollapse && (
            <IconButton label={collapsed ? `Expand ${title}` : `Collapse ${title}`} size="xs" onClick={onToggleCollapse}>
              {collapsed ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronUp className="size-4" aria-hidden="true" />}
            </IconButton>
          )}
        </div>
      </header>

      {!collapsed && (
        <>
          {controlBar && <div className="shrink-0 border-b border-line-subtle px-4 py-2">{controlBar}</div>}
          <div className={cn('min-h-0 flex-1 overflow-auto p-4 scrollbar-thin', bodyClassName)}>{body()}</div>
          {footer && <div className="shrink-0 border-t border-line-subtle px-4 py-2 text-caption text-fg-tertiary">{footer}</div>}
        </>
      )}

      {editing && onResize && !collapsed && (
        <>
          <span
            onPointerDown={startResize('width')}
            role="separator"
            aria-label={`Resize ${title} width, currently ${colSpan} of 4 columns`}
            aria-valuenow={colSpan}
            aria-valuemin={1}
            aria-valuemax={4}
            className="absolute inset-y-6 right-0 w-2 cursor-ew-resize opacity-0 transition-opacity group-hover/widget:opacity-100"
          >
            <span className="absolute right-0.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-line-strong" />
          </span>
          <span
            onPointerDown={startResize('height')}
            role="separator"
            aria-label={`Resize ${title} height, currently ${height ?? MIN_HEIGHT} pixels`}
            aria-valuenow={height ?? MIN_HEIGHT}
            aria-valuemin={MIN_HEIGHT}
            aria-valuemax={MAX_HEIGHT}
            className="absolute inset-x-6 bottom-0 h-2 cursor-ns-resize opacity-0 transition-opacity group-hover/widget:opacity-100"
          >
            <span className="absolute bottom-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-line-strong" />
          </span>
          <span
            onPointerDown={startResize('corner')}
            className="absolute bottom-0 right-0 size-4 cursor-se-resize opacity-0 transition-opacity group-hover/widget:opacity-100"
            aria-hidden="true"
          >
            <span className="absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-line-strong" />
          </span>
          {resizing && (
            <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-md bg-surface-inverse px-2 py-1 text-overline text-fg-inverse tabular">
              {colSpan} col · {height ?? '—'}px
            </span>
          )}
        </>
      )}
    </section>
  );
};

export interface WidgetProps {
  shell: Omit<WidgetShellProps, 'title' | 'children'>;
  instance: WidgetInstance;
}
