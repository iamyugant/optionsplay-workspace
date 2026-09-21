'use client';

import React, { useEffect, useState } from 'react';
import { Copy, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getWidgetMeta } from '@/components/widgets/registry';
import { TEMPLATES, useActiveDashboard, useDashboardStore, type ColSpan, type Device, type WidgetType } from '@/store/dashboardStore';

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: 'max-w-none',
  tablet: 'max-w-3xl',
  mobile: 'max-w-sm',
};

const deviceColumns = (device: Device) =>
  device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';

// Spans are spelled out because Tailwind only keeps class names it can see in source.
const SPAN: Record<ColSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2 xl:col-span-2',
  3: 'col-span-1 md:col-span-2 xl:col-span-3',
  4: 'col-span-1 md:col-span-2 xl:col-span-4',
};
const TABLET_SPAN: Record<ColSpan, string> = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-2', 4: 'col-span-2' };

const EmptyDashboard: React.FC<{ onTemplates: () => void }> = ({ onTemplates }) => {
  const { setEditing, setLibraryOpen, duplicateDashboard, dashboards } = useDashboardStore();
  const options = [
    {
      title: 'Start from scratch',
      description: 'Open the widget library and build your own layout.',
      icon: <Plus className="size-5" />,
      action: () => {
        setEditing(true);
        setLibraryOpen(true);
      },
    },
    {
      title: 'Start from a template',
      description: 'Begin with a proven layout, then make it yours.',
      icon: <LayoutTemplate className="size-5" />,
      action: onTemplates,
    },
    {
      title: 'Duplicate a dashboard',
      description: 'Fork an existing dashboard and experiment safely.',
      icon: <Copy className="size-5" />,
      action: () => duplicateDashboard(dashboards[0]?.id),
    },
  ];

  return (
    <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-line-default bg-surface-default p-8">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-h2 text-fg-primary">Ready to build your own dashboard?</h2>
          <p className="mt-1 text-bodyLg text-fg-tertiary">Every widget can be resized, rearranged and saved as a draft before you publish it.</p>
        </div>
        <ul className="grid w-full gap-3 sm:grid-cols-3">
          {options.map((o) => (
            <li key={o.title}>
              <button
                type="button"
                onClick={o.action}
                className="flex size-full flex-col items-center gap-2 rounded-lg border border-line-default p-5 text-center transition-colors hover:border-brand-blue-600 hover:bg-surface-selected"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-surface-subtle text-fg-link" aria-hidden="true">
                  {o.icon}
                </span>
                <span className="text-h4 text-fg-primary">{o.title}</span>
                <span className="text-bodyMd text-fg-tertiary">{o.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const DashboardCanvas: React.FC = () => {
  const dashboard = useActiveDashboard();
  const {
    isEditing,
    device,
    fitWidth,
    showGrid,
    selectedWidgetId,
    selectWidget,
    moveWidget,
    addWidget,
    removeWidget,
    duplicateWidget,
    patchWidget,
    snapshot,
    copyWidget,
    pasteWidget,
    undo,
    redo,
    createFromTemplate,
  } = useDashboardStore();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, [contenteditable="true"]')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === 'c' && selectedWidgetId) {
        copyWidget();
      } else if (mod && e.key.toLowerCase() === 'v') {
        pasteWidget();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWidgetId) {
        e.preventDefault();
        removeWidget(selectedWidgetId);
      } else if (e.key === 'Escape') {
        selectWidget(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditing, selectedWidgetId, copyWidget, pasteWidget, redo, undo, removeWidget, selectWidget]);

  const widgets = dashboard.widgets;

  return (
    <div className={cn('mx-auto w-full transition-[max-width] duration-base', fitWidth ? 'max-w-none' : 'max-w-[1600px]', DEVICE_WIDTH[device])}>
      {widgets.length === 0 ? (
        <EmptyDashboard onTemplates={() => setTemplatesOpen(true)} />
      ) : (
        <div
          className={cn('grid items-start gap-4', deviceColumns(device), isEditing && showGrid && 'grid-overlay rounded-lg')}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/x-widget-type')) e.preventDefault();
          }}
          onDrop={(e) => {
            const type = e.dataTransfer.getData('application/x-widget-type') as WidgetType;
            if (type) {
              addWidget(type, dropIndex ?? undefined);
              setDropIndex(null);
            }
          }}
        >
          {widgets.map((instance, index) => {
            const meta = getWidgetMeta(instance.type);
            const Widget = meta.component;
            const isDropTarget = dropIndex === index && dragIndex !== index;

            return (
              <div
                key={instance.id}
                className={cn(
                  'relative min-w-0 transition-opacity',
                  device === 'tablet' ? TABLET_SPAN[instance.colSpan] : device === 'mobile' ? 'col-span-1' : SPAN[instance.colSpan],
                  dragIndex === index && 'opacity-40'
                )}
                onDragOver={(e) => {
                  if (!isEditing) return;
                  e.preventDefault();
                  if (dropIndex !== index) setDropIndex(index);
                }}
                onDrop={(e) => {
                  if (!isEditing) return;
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== index) moveWidget(dragIndex, index);
                  setDragIndex(null);
                  setDropIndex(null);
                }}
              >
                {isDropTarget && <span className="absolute -left-2 inset-y-0 z-10 w-1 rounded-full bg-action-primary" aria-hidden="true" />}
                <Widget
                  instance={instance}
                  shell={{
                    id: instance.id,
                    colSpan: instance.colSpan,
                    height: instance.height,
                    collapsed: instance.collapsed,
                    editing: isEditing,
                    selected: selectedWidgetId === instance.id,
                    onSelect: () => selectWidget(instance.id),
                    onToggleCollapse: () => patchWidget(instance.id, { collapsed: !instance.collapsed }),
                    onRemove: isEditing ? () => removeWidget(instance.id) : undefined,
                    onDuplicate: isEditing ? () => duplicateWidget(instance.id) : undefined,
                    onResizeStart: snapshot,
                    onResize: (patch) => patchWidget(instance.id, patch, { record: false }),
                    dragHandleProps: {
                      draggable: true,
                      onDragStart: (e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', instance.id);
                        setDragIndex(index);
                      },
                      onDragEnd: () => {
                        setDragIndex(null);
                        setDropIndex(null);
                      },
                    },
                  }}
                />
              </div>
            );
          })}

          {isEditing && (
            <button
              type="button"
              onClick={() => useDashboardStore.getState().setLibraryOpen(true)}
              onDragOver={(e) => {
                e.preventDefault();
                setDropIndex(widgets.length);
              }}
              className="col-span-1 flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-default text-fg-tertiary transition-colors hover:border-brand-blue-600 hover:bg-surface-selected hover:text-fg-link"
            >
              <Plus className="size-5" aria-hidden="true" />
              <span className="text-bodyMd font-medium">Add a widget</span>
              <span className="text-caption">Drag one here from the library</span>
            </button>
          )}
        </div>
      )}

      <Modal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        title="Start from a template"
        description="Templates are a starting point — rearrange or remove anything afterwards."
        icon={<Sparkles className="size-4" />}
      >
        <ul className="flex flex-col gap-3">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  createFromTemplate(t.id);
                  setTemplatesOpen(false);
                }}
                className="flex w-full items-center gap-4 rounded-md border border-line-default p-4 text-left transition-colors hover:border-brand-blue-600 hover:bg-surface-selected"
              >
                <span className="grid w-24 shrink-0 grid-cols-4 gap-0.5" aria-hidden="true">
                  {t.build().map((w) => (
                    <span key={w.id} className={cn('h-5 rounded-sm bg-brand-blue-200', SPAN[w.colSpan].includes('xl:col-span-3') ? 'col-span-3' : w.colSpan === 2 ? 'col-span-2' : 'col-span-1')} />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="block text-h4 text-fg-primary">{t.name}</span>
                  <span className="block text-bodyMd text-fg-tertiary">{t.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setTemplatesOpen(false)}>
          Cancel
        </Button>
      </Modal>
    </div>
  );
};
