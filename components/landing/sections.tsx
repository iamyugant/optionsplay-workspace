'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn, focusRing, TOKEN_COUNT } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { DemoStage, StageFrame, type DemoStageProps, type MiniWidget } from './DemoStage';

const W = (id: string, kind: MiniWidget['kind'], span: MiniWidget['span'], height: number): MiniWidget => ({ id, kind, span, height });

export const STAGE_PRESETS: Record<string, { designWidth: number; designHeight: number; props: DemoStageProps }> = {
  layout: {
    designWidth: 720,
    designHeight: 380,
    props: { widgets: [W('a', 'analysis', 2, 280), W('q', 'watchlist', 2, 280)], gridOverlay: true },
  },
  library: {
    designWidth: 720,
    designHeight: 380,
    props: { widgets: [W('t', 'strategies', 4, 280)], libraryOpen: true, highlightLibraryIndex: 2, selectedId: 't' },
  },
  analytics: {
    designWidth: 720,
    designHeight: 380,
    props: { widgets: [W('s', 'screener', 4, 280)] },
  },
  build: {
    designWidth: 1160,
    designHeight: 440,
    props: { widgets: [W('a', 'analysis', 1, 340), W('q', 'watchlist', 1, 340), W('c', 'calendar', 2, 340)], libraryOpen: true, gridOverlay: true },
  },
  analyze: {
    designWidth: 1160,
    designHeight: 440,
    props: { widgets: [W('a', 'analysis', 2, 340), W('s', 'screener', 2, 340)], selectedId: 'a' },
  },
  execute: {
    designWidth: 1160,
    designHeight: 440,
    props: { widgets: [W('t', 'strategies', 2, 340), W('q', 'watchlist', 2, 340)], ticketOpen: true },
  },
  income: {
    designWidth: 1160,
    designHeight: 420,
    props: { widgets: [W('i', 'income', 2, 320), W('c', 'calendar', 2, 320)] },
  },
};

export const StagePreset: React.FC<{ preset: keyof typeof STAGE_PRESETS; chrome?: boolean; className?: string }> = ({ preset, chrome, className }) => {
  const { designWidth, designHeight, props } = STAGE_PRESETS[preset];
  return (
    <StageFrame designWidth={designWidth} designHeight={designHeight} chrome={chrome} className={className}>
      <DemoStage {...props} />
    </StageFrame>
  );
};

const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor className="size-4" />, width: 1160, height: 440, frame: 'max-w-full' },
  { id: 'tablet', label: 'Tablet', icon: <Tablet className="size-4" />, width: 760, height: 520, frame: 'max-w-xl' },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="size-4" />, width: 380, height: 620, frame: 'max-w-64' },
] as const;

type DeviceId = (typeof DEVICES)[number]['id'];

const DEVICE_WIDGETS: Record<DeviceId, MiniWidget[]> = {
  desktop: [W('a', 'analysis', 1, 340), W('s', 'screener', 2, 340), W('q', 'watchlist', 1, 340)],
  tablet: [W('a', 'analysis', 2, 400), W('q', 'watchlist', 2, 400), W('s', 'screener', 4, 0)],
  mobile: [W('a', 'analysis', 4, 300), W('q', 'watchlist', 4, 260)],
};

export const FormFactorShowcase: React.FC = () => {
  const [device, setDevice] = useState<DeviceId>('desktop');
  const config = DEVICES.find((d) => d.id === device)!;
  const widgets = DEVICE_WIDGETS[device].filter((w) => w.height > 0);

  return (
    <div className="flex flex-col items-center gap-6">
      <Tabs
        aria-label="Preview device"
        activeId={device}
        onChange={(id) => setDevice(id as DeviceId)}
        items={DEVICES.map((d) => ({ id: d.id, label: d.label, icon: d.icon }))}
      />
      <div className={cn('w-full transition-[max-width] duration-slow ease-standard', config.frame)}>
        <StageFrame designWidth={config.width} designHeight={config.height} chrome={device === 'desktop'}>
          <DemoStage widgets={widgets} />
        </StageFrame>
      </div>
      <p className="max-w-xl text-center text-bodyLg text-fg-secondary">
        One layout definition, three breakpoints: columns collapse from four to two to one, and every touch target stays at
        44&nbsp;px on phones.
      </p>
    </div>
  );
};

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  deliverables: string[];
  outcome: string;
  proof: string;
}

export const SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    goal: 'Foundations & variable engine',
    deliverables: [
      'Six semantic color scales with contrast verified at source',
      'Nine-step type scale plus a dynamic-type matrix',
      '8pt spacing, radius, elevation and motion tokens',
      'Compiler: tokens.json → CSS variables, Tailwind theme, TypeScript types',
    ],
    outcome: 'One source of truth instead of twelve years of drift.',
    proof: `${TOKEN_COUNT} tokens · 1 source file`,
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    goal: 'Atomic & molecular components',
    deliverables: [
      'Buttons, inputs, dropdowns, toggles, badges and tabs across every state',
      'Symbol autocomplete built on the ARIA combobox pattern',
      'Data table with sorting, selection and pagination',
      'Do’s and don’ts documented next to each component',
    ],
    outcome: 'Teams stopped hand-rolling one-off controls.',
    proof: '22 components · 5 states each',
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3',
    goal: 'Widget shell & spatial engine',
    deliverables: [
      'Master widget shell: header, control bar, body, footer',
      'Loading, error, empty, locked and content states in one place',
      'Four-column 8pt grid with drag, resize and keyboard resizing',
      'Draft → save → publish workflow with undo/redo',
    ],
    outcome: 'Any new feature inherits the layout rules for free.',
    proof: '7 widgets · 1 shell',
  },
  {
    id: 'sprint-4',
    name: 'Sprint 4',
    goal: 'Feature modules',
    deliverables: [
      'Technical analysis, credit spreads and top strategies',
      'Quote board with a shared simulated live feed',
      'Income screener and DailyPlay journal',
      'Order ticket following Scan → Analyze → Execute',
    ],
    outcome: 'The system proved itself under real trading density.',
    proof: '1 data layer · every widget',
  },
  {
    id: 'sprint-5',
    name: 'Sprint 5',
    goal: 'Handoff, guardrails & MCP',
    deliverables: [
      'Living documentation with live contrast verification',
      'Build-time guardrail rejecting hardcoded colors',
      'MCP server exposing tokens and component specs to AI agents',
      'Landing page and dashboard shipped from the same tokens',
    ],
    outcome: 'The system now enforces itself in CI and in the agent loop.',
    proof: '0 violations · 4 MCP tools',
  },
];

export const AgileTimeline: React.FC = () => {
  const [active, setActive] = useState(0);
  const sprint = SPRINTS[active];

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch" aria-label="Delivery sprints">
        {SPRINTS.map((s, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex size-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors duration-base',
                  isActive ? 'border-brand-blue-600 bg-surface-selected' : 'border-line-default bg-surface-default hover:border-line-strong',
                  focusRing
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold tabular',
                      isActive || isDone ? 'bg-action-primary text-fg-inverse' : 'bg-surface-muted text-fg-secondary'
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn('text-bodyLg font-medium', isActive ? 'text-fg-link' : 'text-fg-primary')}>{s.name}</span>
                </span>
                <span className="text-bodyMd text-fg-secondary">{s.goal}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 rounded-xl border border-line-default bg-surface-default p-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-h2 text-fg-primary">{sprint.goal}</h3>
            <Badge variant="info">{sprint.name}</Badge>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {sprint.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2 text-bodyLg text-fg-secondary">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-green-500" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-lg bg-surface-subtle p-5">
          <div>
            <p className="text-overline text-fg-tertiary">Outcome</p>
            <p className="mt-1 text-h3 text-fg-primary">{sprint.outcome}</p>
          </div>
          <p className="font-mono text-bodyLg text-fg-link">{sprint.proof}</p>
        </div>
      </div>
    </div>
  );
};
