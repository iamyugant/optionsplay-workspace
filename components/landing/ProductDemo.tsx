'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { cn, focusRing } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks';
import { DemoStage, StageFrame, type DemoStageProps, type MiniWidget } from './DemoStage';

// The "video" is the real interface on a script: it stays in sync with the components, and it
// pauses itself when off-screen or when the visitor prefers reduced motion.

const W = (id: string, kind: MiniWidget['kind'], span: MiniWidget['span'], height: number): MiniWidget => ({ id, kind, span, height });

const BASE: MiniWidget[] = [W('a', 'analysis', 1, 280), W('s', 'screener', 2, 280), W('q', 'watchlist', 1, 280)];

interface Scene {
  id: string;
  title: string;
  caption: string;
  duration: number;
  state: Omit<DemoStageProps, 'tick'>;
}

const SCENES: Scene[] = [
  {
    id: 'start',
    title: 'Start your way',
    caption: 'Open a blank canvas, pick a template, or fork a dashboard a colleague already built.',
    duration: 4200,
    state: { widgets: [], templatePicker: true, highlightLibraryIndex: 1, cursor: { x: 50, y: 52, clicking: true } },
  },
  {
    id: 'layout',
    title: 'A layout in one click',
    caption: 'The template drops in analysis, a credit-spread screener and your watchlist on an 8pt grid.',
    duration: 4200,
    state: { widgets: BASE, cursor: { x: 62, y: 40 } },
  },
  {
    id: 'add',
    title: 'Add any widget',
    caption: 'Drag from the library or click to append — every widget is a module you can rearrange.',
    duration: 4600,
    state: {
      widgets: [...BASE, W('t', 'strategies', 2, 200)],
      libraryOpen: true,
      highlightLibraryIndex: 2,
      selectedId: 't',
      cursor: { x: 12, y: 58, clicking: true },
    },
  },
  {
    id: 'resize',
    title: 'Resize to fit your eye',
    caption: 'Drag an edge to span 1–4 columns. Heights snap to the 8pt grid, so nothing ever lands off-system.',
    duration: 4600,
    state: {
      widgets: [...BASE, W('t', 'strategies', 4, 240)],
      libraryOpen: true,
      gridOverlay: true,
      selectedId: 't',
      resizingId: 't',
      cursor: { x: 92, y: 74 },
    },
  },
  {
    id: 'live',
    title: 'Live market data',
    caption: 'Prices stream in and flash on every tick. Selecting a symbol drives every other widget at once.',
    duration: 4600,
    state: { widgets: [...BASE, W('t', 'strategies', 4, 240)], selectedId: null, cursor: { x: 84, y: 32 } },
  },
  {
    id: 'execute',
    title: 'Scan → Analyze → Execute',
    caption: 'Send any idea straight to an order ticket with probability, max risk and reward already filled in.',
    duration: 4800,
    state: { widgets: [...BASE, W('t', 'strategies', 4, 240)], ticketOpen: true, cursor: { x: 56, y: 60, clicking: true } },
  },
  {
    id: 'publish',
    title: 'Publish when it’s ready',
    caption: 'Drafts stay private until you publish. Fork, experiment and merge without touching the live view.',
    duration: 4200,
    state: { widgets: [...BASE, W('t', 'strategies', 4, 240)], published: true, toast: '“Options Trader” is live', cursor: { x: 95, y: 13, clicking: true } },
  },
];

const TOTAL = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const ProductDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  const compact = useMediaQuery('(max-width: 720px)');
  const scene = SCENES[index];
  const active = playing && visible && !reduced;

  // A four-column canvas is unreadable once scaled to phone width, so widgets stack instead.
  const stageProps = useMemo(() => {
    if (!compact) return scene.state;
    return {
      ...scene.state,
      libraryOpen: false,
      widgets: scene.state.widgets.slice(0, 2).map((w) => ({ ...w, span: 4 as const, height: 260 })),
    };
  }, [compact, scene.state]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), scene.duration);
    return () => window.clearTimeout(timer);
  }, [active, index, scene.duration]);

  useEffect(() => {
    if (!active || !['live', 'execute'].includes(scene.id)) return;
    const interval = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(interval);
  }, [active, scene.id]);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setPlaying(true);
  }, []);

  const elapsed = useMemo(() => SCENES.slice(0, index).reduce((sum, s) => sum + s.duration, 0), [index]);

  return (
    <div ref={containerRef} className={cn('flex w-full flex-col gap-4', className)}>
      <StageFrame chrome designWidth={compact ? 560 : 1160} designHeight={compact ? 640 : 620}>
        <DemoStage {...stageProps} tick={tick} />
      </StageFrame>

      {/* Transport controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-full border border-line-default bg-surface-default px-3 py-2 shadow-elevation-1">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause demo' : 'Play demo'}
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-full bg-action-primary text-fg-inverse transition-colors hover:bg-action-primary-hover', focusRing)}
        >
          {playing && !reduced ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setTick(0);
            setPlaying(true);
          }}
          aria-label="Restart demo"
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-fg-secondary transition-colors hover:bg-surface-subtle', focusRing)}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2" role="group" aria-label="Demo chapters">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Chapter ${i + 1}: ${s.title}`}
              aria-current={i === index ? 'true' : undefined}
              className={cn('group relative h-2 flex-1 rounded-full bg-surface-muted transition-colors', focusRing)}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full bg-action-primary transition-[width]',
                  i < index ? 'w-full' : i === index ? 'w-full' : 'w-0'
                )}
                style={i === index && active ? { animation: `demo-progress ${s.duration}ms linear` } : undefined}
              />
            </button>
          ))}
        </div>

        <span className="shrink-0 text-caption text-fg-tertiary tabular">
          {Math.round(elapsed / 1000)}s / {Math.round(TOTAL / 1000)}s
        </span>
      </div>

      {/* Caption */}
      <div className="flex min-h-14 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4" aria-live="polite">
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-action-primary text-caption font-semibold text-fg-inverse tabular">{index + 1}</span>
          <span className="text-h4 text-fg-primary">{scene.title}</span>
        </span>
        <span className="text-bodyLg text-fg-secondary">{scene.caption}</span>
      </div>

      {reduced && (
        <p className="text-bodyMd text-fg-tertiary">
          Motion is reduced on your device, so the demo is paused. Use the chapter buttons to step through it, or{' '}
          <Link href="/dashboard" className="text-fg-link underline underline-offset-4">
            open the real dashboard
          </Link>
          .
        </p>
      )}
    </div>
  );
};
