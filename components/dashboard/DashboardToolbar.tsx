'use client';

import React from 'react';
import { ClipboardPaste, Copy, Eye, Monitor, MoveHorizontal, PanelLeft, Pencil, Redo2, Smartphone, Grid2x2, Tablet, Undo2 } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { getDashboardStatus, useActiveDashboard, useDashboardStore, type Device } from '@/store/dashboardStore';

const DEVICES: { id: Device; label: string; icon: React.ReactNode }[] = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor className="size-4" /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet className="size-4" /> },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="size-4" /> },
];

export const DashboardToolbar: React.FC = () => {
  const dashboard = useActiveDashboard();
  const {
    isEditing,
    setEditing,
    libraryOpen,
    setLibraryOpen,
    undo,
    redo,
    past,
    future,
    copyWidget,
    pasteWidget,
    clipboard,
    selectedWidgetId,
    fitWidth,
    toggleFitWidth,
    showGrid,
    toggleGrid,
    device,
    setDevice,
    save,
    publish,
    discardChanges,
  } = useDashboardStore();

  const { hasUnsaved, isDraft, isLive } = getDashboardStatus(dashboard);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line-subtle bg-surface-default px-4 py-2">
      <div className="flex items-center gap-1">
        <h1 className="mr-1 truncate text-h4 text-fg-primary">{dashboard.name}</h1>
        {dashboard.forkedFrom && <Badge variant="warning">Forked</Badge>}
        {hasUnsaved ? <Badge variant="warning">Unsaved</Badge> : isDraft ? <Badge variant="info">Draft</Badge> : null}
        {isLive && (
          <Badge variant="bullish" dot>
            Live
          </Badge>
        )}
        <span className="ml-1 text-caption text-fg-tertiary tabular">
          {dashboard.widgets.length} widget{dashboard.widgets.length === 1 ? '' : 's'}
        </span>
      </div>

      {isEditing && (
        <div className="flex items-center gap-0.5 border-l border-line-subtle pl-2">
          <Tooltip content="Toggle widget library">
            <IconButton label="Toggle widget library" active={libraryOpen} onClick={() => setLibraryOpen(!libraryOpen)}>
              <PanelLeft className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Undo (⌘Z)">
            <IconButton label="Undo" disabled={!past.length} onClick={undo}>
              <Undo2 className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Redo (⇧⌘Z)">
            <IconButton label="Redo" disabled={!future.length} onClick={redo}>
              <Redo2 className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Copy selected widget (⌘C)">
            <IconButton label="Copy widget" disabled={!selectedWidgetId} onClick={() => copyWidget()}>
              <Copy className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Paste widget (⌘V)">
            <IconButton label="Paste widget" disabled={!clipboard} onClick={pasteWidget}>
              <ClipboardPaste className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content={fitWidth ? 'Use fixed canvas width' : 'Fit canvas to window'}>
            <IconButton label="Fit to width" active={fitWidth} onClick={toggleFitWidth}>
              <MoveHorizontal className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Toggle 8pt grid overlay">
            <IconButton label="Toggle grid" active={showGrid} onClick={toggleGrid}>
              <Grid2x2 className="size-4" aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-0.5 rounded-md border border-line-default p-0.5 md:flex" role="group" aria-label="Preview size">
          {DEVICES.map((d) => (
            <IconButton key={d.id} label={`${d.label} preview`} size="xs" active={device === d.id} onClick={() => setDevice(d.id)}>
              {d.icon}
            </IconButton>
          ))}
        </div>

        {isEditing ? (
          <>
            {hasUnsaved && (
              <Button variant="ghost" size="sm" onClick={discardChanges}>
                Discard
              </Button>
            )}
            <Button variant="secondary" size="sm" iconLeading={<Eye className="size-3.5" />} onClick={() => setEditing(false)}>
              Preview
            </Button>
            <Button variant="secondary" size="sm" disabled={!hasUnsaved} onClick={save}>
              Save
            </Button>
            <Button variant="primary" size="sm" disabled={isLive} onClick={publish}>
              Publish
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" iconLeading={<Pencil className="size-3.5" />} onClick={() => setEditing(true)}>
            Edit layout
          </Button>
        )}
      </div>
    </div>
  );
};
