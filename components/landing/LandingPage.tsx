'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, Gauge, Keyboard, Layers, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { asset, cn, focusRing, TOKEN_COUNT } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { ProductDemo } from './ProductDemo';
import { AgileTimeline, FormFactorShowcase, StagePreset } from './sections';

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('transition-all duration-slow ease-standard', shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0', className)}
    >
      {children}
    </div>
  );
};

const NAV = [
  { href: '#demo', label: 'Demo' },
  { href: '#features', label: 'Features' },
  { href: '#whats-new', label: "What's new" },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#process', label: 'Process' },
];

const STATS = [
  { value: '22', label: 'Components', note: 'Each with every state documented' },
  { value: String(TOKEN_COUNT), label: 'Design tokens', note: 'One JSON file, three outputs' },
  { value: '0', label: 'Hardcoded colors', note: 'Enforced by the build' },
  { value: 'AA', label: 'WCAG 2.1', note: 'Contrast verified in the browser' },
];

const FEATURES = [
  {
    icon: asset('/landing/feature-modern.svg'),
    title: 'New & Modern Experience',
    body: 'A refreshed UI with simplified navigation, cleaner layouts and smoother workflows built for faster decision-making.',
    points: ['Flat, calm surfaces that keep data first', 'One focus style across every control'],
  },
  {
    icon: asset('/landing/feature-dashboards.svg'),
    title: 'Advanced Widgets & Tools',
    body: 'A professional-grade suite of options analytics, strategy tools, scanners and market insights, all available as modular widgets.',
    points: ['Technical analysis, screeners, strategies, journal', 'Every widget shares one live data layer'],
  },
  {
    icon: asset('/landing/feature-formfactor.svg'),
    title: 'Customizable Dashboards',
    body: 'Drag, drop, resize and rearrange widgets to build a workspace that fits your personal trading style.',
    points: ['Undo, redo, copy and paste while you build', 'Drafts stay private until you publish'],
  },
  {
    icon: asset('/landing/feature-analytics.svg'),
    title: 'Multi Form Factor Support',
    body: 'A seamless, responsive experience across desktop, widescreen setups and tablets.',
    points: ['Four columns collapse to one, predictably', '44px touch targets on every handheld'],
  },
  {
    icon: asset('/landing/feature-modern.svg'),
    title: 'Professional Analytics Suite',
    body: 'Profit/loss modeling, probability analysis, risk scoring and scenario simulation in a clean, intuitive format.',
    points: ['Payoff, probability and risk on one row', 'Scores you can read at a glance'],
  },
];

const WHATS_NEW = [
  {
    title: 'Modern Layout System',
    body: 'A cleaner, faster and more intuitive interface. Everything sits on an 8pt grid, so density stays consistent as you add widgets.',
    preset: 'layout' as const,
    badge: 'Rebuilt',
  },
  {
    title: 'Modular Widget Library',
    body: 'Build your ideal trading workspace. Search the library, drag a card onto the canvas and resize it to the width you want.',
    preset: 'library' as const,
    badge: 'New',
  },
  {
    title: 'Smarter Analytics & Insights',
    body: 'Clearer visualizations and strategy comparisons powered by real-time data, with scores and probabilities on every row.',
    preset: 'analytics' as const,
    badge: 'Improved',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Build your dashboard',
    body: 'Add widgets, choose a layout and personalize your workspace. Drag to reorder, drag an edge to resize, or use Alt + arrow keys.',
    preset: 'build' as const,
    bullets: ['Templates or a blank canvas', 'Undo/redo the whole session'],
  },
  {
    n: '02',
    title: 'Analyze your trades',
    body: 'Explore chains, strategies and risk tools in one unified view. Pick a symbol once and every widget follows it.',
    preset: 'analyze' as const,
    bullets: ['Trend, liquidity and IV rank at a glance', 'Screeners ranked by premium and probability'],
  },
  {
    n: '03',
    title: 'Make confident decisions',
    body: 'Execute smarter trades with clearer insights. Every idea carries its probability, maximum risk and reward into the ticket.',
    preset: 'execute' as const,
    bullets: ['Scan → Analyze → Execute in three steps', 'Nothing hidden behind a second screen'],
  },
];

const SYSTEM_POINTS = [
  { icon: <Layers className="size-5" />, title: 'Token-first', body: 'Colors, type, spacing and motion all resolve to one JSON file that compiles to CSS, Tailwind and types.' },
  { icon: <ShieldCheck className="size-5" />, title: 'Accessible by construction', body: 'Icon buttons require labels, focus is one token, and contrast is verified in the browser.' },
  { icon: <Keyboard className="size-5" />, title: 'Keyboard complete', body: 'Tabs, menus, the calendar and even widget resizing work without a mouse.' },
  { icon: <Terminal className="size-5" />, title: 'Agent-ready', body: 'An MCP server hands tokens and component specs to AI tools instead of letting them guess.' },
];

const FAQ = [
  {
    id: 'data',
    question: 'Is the market data real?',
    answer:
      'No — this is a prototype. Prices are simulated by a seeded generator and streamed from one interval, so every widget stays in sync and the numbers are identical on every load. Swapping in a real feed means replacing one module.',
  },
  {
    id: 'saved',
    question: 'Where do my dashboards live?',
    answer: 'In your browser’s local storage. Layouts, watchlist and the symbol you were last looking at survive a reload, with nothing sent to a server.',
  },
  {
    id: 'design',
    question: 'How does the design stay in sync with Figma?',
    answer:
      'Tokens are exported as JSON and compiled into CSS variables, Tailwind theme values and TypeScript types. A build step rejects any hardcoded color, so code cannot drift from the design file.',
  },
  {
    id: 'demo',
    question: 'Is the demo above a video?',
    answer:
      'It is the real interface, scripted. Nothing to buffer, it works offline, it respects reduced-motion settings, and it updates automatically whenever the components change.',
  },
];

const HeroChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-line-default bg-surface-default/80 px-3 py-1 text-bodyMd text-fg-secondary backdrop-blur">
    {children}
  </span>
);

const SectionHead: React.FC<{ eyebrow?: string; title: string; body?: string; className?: string }> = ({ eyebrow, title, body, className }) => (
  <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
    {eyebrow && <p className="text-overline text-fg-link">{eyebrow}</p>}
    <h2 className="max-w-3xl text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-fg-primary">{title}</h2>
    {body && <p className="max-w-2xl text-h4 font-normal text-fg-secondary">{body}</p>}
  </div>
);

export const LandingPage: React.FC = () => (
  <div className="flex flex-col">
    {/* Sticky nav */}
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface-default/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className={cn('flex shrink-0 items-center rounded-sm', focusRing)} aria-label="OptionsPlay home">
          <Image src={asset('/brand/optionsplay-logo.png')} alt="OptionsPlay" width={162} height={101} className="h-9 w-auto" priority />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn('rounded-md px-3 py-2 text-bodyLg text-fg-secondary transition-colors hover:bg-surface-subtle hover:text-fg-primary', focusRing)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/design-system"
            className={cn('hidden rounded-md px-3 py-2 text-bodyLg text-fg-secondary transition-colors hover:bg-surface-subtle hover:text-fg-primary sm:block', focusRing)}
          >
            Design system
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-green-500 px-4 text-bodyLg font-semibold text-fg-primary transition-colors hover:bg-brand-green-400',
              focusRing
            )}
          >
            Open dashboard
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_-25%,var(--surface-canvas)_42%,var(--brand-green-100)_70%,var(--brand-green-300)_100%)] px-4 pb-16 pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <Badge variant="brand" className="mb-5">
          Redesigned workspace · 2026
        </Badge>
        <h1 className="max-w-4xl text-balance text-center text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.08] tracking-tight text-fg-primary">
          Your Smarter Trading Workspace
        </h1>
        <p className="mt-5 max-w-2xl text-center text-h4 font-normal leading-relaxed text-fg-secondary">
          A redesigned, customizable dashboard built for traders who want clarity, speed and powerful analytics, all in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#demo"
            className={cn(
              'inline-flex h-14 items-center gap-2 rounded-full bg-surface-inverse px-6 text-h4 font-semibold text-fg-inverse transition-colors hover:bg-semantic-neutral-800',
              focusRing
            )}
          >
            <Gauge className="size-5" aria-hidden="true" />
            Watch the 30-second demo
          </a>
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex h-14 items-center gap-2 rounded-full bg-brand-green-500 px-6 text-h4 font-semibold text-fg-primary transition-colors hover:bg-brand-green-400',
              focusRing
            )}
          >
            Try the new dashboard
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <HeroChip>
            <Sparkles className="size-3.5 text-fg-link" aria-hidden="true" /> No sign-up required
          </HeroChip>
          <HeroChip>
            <ShieldCheck className="size-3.5 text-fg-bullish" aria-hidden="true" /> WCAG 2.1 AA verified
          </HeroChip>
          <HeroChip>
            <Layers className="size-3.5 text-fg-link" aria-hidden="true" /> {TOKEN_COUNT} design tokens
          </HeroChip>
        </div>

        <div id="demo" className="mt-12 w-full max-w-5xl scroll-mt-20">
          <ProductDemo />
        </div>
      </div>
    </section>

    {/* Stats */}
    <section aria-label="By the numbers" className="border-y border-line-subtle bg-surface-default px-4 py-10">
      <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <li className="flex flex-col gap-1 text-center">
              <span className="text-display text-fg-primary tabular">{s.value}</span>
              <span className="text-h4 text-fg-primary">{s.label}</span>
              <span className="text-bodyMd text-fg-tertiary">{s.note}</span>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>

    {/* Features */}
    <section id="features" aria-labelledby="features-heading" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        <SectionHead
          eyebrow="Our features"
          title="Everything a modern options trader needs"
          body="Five pillars, each backed by a component in the library and a widget on the dashboard."
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className="h-full">
              <li className="flex h-full flex-col gap-5 rounded-2xl border border-line-default bg-surface-default p-8 transition-shadow duration-base hover:shadow-elevation-2">
                <Image src={f.icon} alt="" width={74} height={74} className="size-16" />
                <div>
                  <h3 className="text-h3 text-fg-primary">{f.title}</h3>
                  <p className="mt-2 text-bodyLg leading-relaxed text-fg-secondary">{f.body}</p>
                </div>
                <ul className="mt-auto flex flex-col gap-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-bodyMd text-fg-tertiary">
                      <Check className="mt-0.5 size-4 shrink-0 text-fg-bullish" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>

    {/* What's new */}
    <section id="whats-new" aria-labelledby="whats-new-heading" className="scroll-mt-20 bg-surface-default px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        <SectionHead eyebrow="What's new" title="What’s new in this dashboard?" body="Three changes you will feel in the first minute." />
        <ul className="grid gap-6 lg:grid-cols-3">
          {WHATS_NEW.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="h-full">
              <li className="flex h-full flex-col gap-4 rounded-2xl border border-line-default p-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-h2 text-fg-primary">{item.title}</h3>
                  <Badge variant={item.badge === 'New' ? 'new' : item.badge === 'Rebuilt' ? 'brand' : 'success'}>{item.badge}</Badge>
                </div>
                <p className="text-bodyLg leading-relaxed text-fg-secondary">{item.body}</p>
                <div className="mt-auto -mb-6 -mr-6 overflow-hidden pl-6 pt-2">
                  <StagePreset preset={item.preset} />
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>

    {/* How it works */}
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-20 bg-[radial-gradient(70%_50%_at_50%_30%,var(--brand-green-50)_0%,var(--surface-canvas)_75%)] px-4 py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHead eyebrow="How it works" title="A simpler, smarter workflow built for modern traders." />
        <ol className="flex flex-col gap-16">
          {STEPS.map((step, i) => (
            <li key={step.n}>
              <Reveal>
                <div className={cn('flex flex-col items-center gap-8 lg:flex-row lg:gap-12', i % 2 === 1 && 'lg:flex-row-reverse')}>
                  <div className="flex-1">
                    <p className="text-h4 text-fg-tertiary tabular">/{step.n}</p>
                    <h3 className="mt-1 text-h1 text-fg-primary">{step.title}</h3>
                    <p className="mt-3 text-h4 font-normal leading-relaxed text-fg-secondary">{step.body}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-bodyLg text-fg-secondary">
                          <Check className="mt-1 size-4 shrink-0 text-fg-bullish" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-full flex-1">
                    <StagePreset preset={step.preset} chrome />
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Form factor */}
    <section aria-labelledby="form-factor-heading" className="bg-surface-default px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <SectionHead eyebrow="Multi form factor" title="The same workspace, on every screen" />
        <Reveal>
          <FormFactorShowcase />
        </Reveal>
      </div>
    </section>

    {/* Process */}
    <section id="process" aria-labelledby="process-heading" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <SectionHead
          eyebrow="How it was built"
          title="Five sprints, one system"
          body="Each sprint shipped something usable and tightened the constraints on the next one — the design system grew with the product instead of ahead of it."
        />
        <Reveal>
          <AgileTimeline />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SYSTEM_POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 60} className="h-full">
              <li className="flex h-full flex-col gap-2 rounded-lg border border-line-default bg-surface-default p-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-surface-selected text-fg-link" aria-hidden="true">
                  {p.icon}
                </span>
                <h3 className="text-h4 text-fg-primary">{p.title}</h3>
                <p className="text-bodyMd text-fg-secondary">{p.body}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>

    {/* FAQ */}
    <section aria-labelledby="faq-heading" className="bg-surface-default px-4 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <SectionHead title="Questions, answered" />
        <Accordion items={FAQ} defaultOpenId="demo" />
      </div>
    </section>

    {/* Closing CTA */}
    <section className="bg-surface-inverse px-4 py-20 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-tight text-fg-inverse">Build your workspace in minutes</h2>
        <p className="text-h4 font-normal text-semantic-neutral-400">
          Start from a template or a blank canvas. Save drafts, fork layouts and publish when you’re ready — no account needed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex h-12 items-center gap-2 rounded-full bg-brand-green-500 px-6 text-h4 font-semibold text-fg-primary transition-colors hover:bg-brand-green-400',
              focusRing
            )}
          >
            Open the dashboard
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/design-system"
            className={cn(
              'inline-flex h-12 items-center rounded-full border border-semantic-neutral-600 px-6 text-h4 font-semibold text-fg-inverse transition-colors hover:bg-semantic-neutral-800',
              focusRing
            )}
          >
            Explore the design system
          </Link>
        </div>
      </div>
    </section>

    <footer className="bg-surface-inverse px-4 pb-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 border-t border-semantic-neutral-700 pt-8 text-center">
        <p className="text-bodyMd text-semantic-neutral-500">
          OptionsPlay design system prototype · Next.js, token-first Tailwind and Model Context Protocol.
        </p>
        <p className="text-caption text-semantic-neutral-600">Simulated market data. Nothing here is investment advice.</p>
      </div>
    </footer>
  </div>
);
