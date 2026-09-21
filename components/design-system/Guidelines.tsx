'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { DsSection, DoDont, Specimen, CopyChip } from './parts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import tokens from '@/tokens/tokens.json';
import { checkWcagCompliance, cn, getContrastRatio } from '@/lib/utils';

const WHITE = tokens.color.semantic.neutral['0'].value;

function contrastPairs() {
  const pairs: { pair: string; fg: string; bg: string }[] = [
    { pair: 'Primary text on canvas', fg: tokens.color.semantic.neutral['900'].value, bg: tokens.color.semantic.neutral['100'].value },
    { pair: 'Secondary text on surface', fg: tokens.color.semantic.neutral['700'].value, bg: WHITE },
    { pair: 'Tertiary text on surface', fg: tokens.color.semantic.neutral['600'].value, bg: WHITE },
    { pair: 'Inverse text on Blue/600', fg: WHITE, bg: tokens.color.brand.blue['600'].value },
    { pair: 'Bullish badge', fg: tokens.color.semantic.success['800'].value, bg: tokens.color.semantic.success['100'].value },
    { pair: 'Bearish badge', fg: tokens.color.semantic.red['800'].value, bg: tokens.color.semantic.red['100'].value },
    { pair: 'Warning badge', fg: tokens.color.semantic.amber['800'].value, bg: tokens.color.semantic.amber['100'].value },
    { pair: 'Info badge', fg: tokens.color.brand.blue['700'].value, bg: tokens.color.brand.blue['100'].value },
    { pair: 'Primary text on brand lime', fg: tokens.color.semantic.neutral['900'].value, bg: tokens.color.brand.green['500'].value },
    { pair: 'Inverse text on lime/700', fg: WHITE, bg: tokens.color.brand.green['700'].value },
  ];
  return pairs.map((p) => {
    const ratio = getContrastRatio(p.fg, p.bg);
    return { ...p, ratio, ...checkWcagCompliance(ratio) };
  });
};

const ANATOMY = [
  { token: '--action-primary', label: 'Color token', value: 'Brand/Blue/600 · #00539F · AA on white' }, // tokens-ignore: documented token value
  { token: '--radius-md', label: 'Elevation token', value: 'Level 0 — flat, 8px radius, no stroke' },
  { token: '--button-padding-x', label: 'Spacing token', value: '16px horizontal · 8px vertical · 36px height' },
  { token: '--font-size-bodyLg', label: 'Typography token', value: 'Body/Lg · 14/20 · weight 500' },
];

const WCAG_CHECKS = [
  { id: '1.4.3', name: 'Contrast (minimum)', how: 'Every text token pair is verified below; the build fails on hardcoded colors.' },
  { id: '1.4.1', name: 'Use of color', how: 'Bullish/bearish values carry a +/− sign and an arrow, not just color.' },
  { id: '1.4.11', name: 'Non-text contrast', how: 'Borders, focus rings and chart strokes use Neutral/400 or darker.' },
  { id: '2.1.1', name: 'Keyboard', how: 'Tabs, menus, dropdowns, the calendar and widget resizing all work from the keyboard.' },
  { id: '2.4.7', name: 'Focus visible', how: 'A single 2px Blue/600 ring token is applied to every interactive element.' },
  { id: '2.5.5', name: 'Target size', how: 'Touch targets are at least 44×44px; the bottom nav enforces it.' },
  { id: '4.1.2', name: 'Name, role, value', how: 'Icon-only buttons require a label prop; tables expose aria-sort.' },
  { id: '2.3.3', name: 'Animation from interactions', how: 'prefers-reduced-motion collapses all transitions to 1ms.' },
];

export const Guidelines: React.FC = () => {
  const contrast = contrastPairs();

  return (
    <>
      <DsSection id="anatomy" title="Anatomy" intro="Every component references tokens rather than values — that is what makes a palette or spacing change a one-line edit.">
        <Specimen title="Primary button, decomposed">
          <div className="flex flex-col items-center gap-6 py-4 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
            <Button size="lg" className="shrink-0">
              Primary Button
            </Button>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ANATOMY.map((a) => (
                <li key={a.token} className="rounded-md border border-line-subtle p-3">
                  <p className="text-overline text-fg-tertiary">{a.label}</p>
                  <CopyChip value={a.token} />
                  <p className="mt-1 text-bodyMd text-fg-secondary">{a.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </Specimen>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['01 — Organisms', 'Every new feature inherits the same spatial logic without anyone enforcing it by hand.'],
            ['02 — Semantic names', 'Tokens are named by function (surface, line, action), not by appearance.'],
            ['03 — JSON export', 'Design and code share one token source; tokens.json compiles to CSS, Tailwind and types.'],
            ['04 — Token first', 'Components reference tokens for handoff and future re-theming.'],
            ['05 — Additive variants', 'New variants extend the system instead of replacing existing ones.'],
            ['06 — Usage docs', 'Each component ships do’s and don’ts alongside the code.'],
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-line-default bg-surface-default p-4">
              <h3 className="text-h4 text-fg-primary">{title}</h3>
              <p className="mt-1 text-bodyMd text-fg-secondary">{body}</p>
            </article>
          ))}
        </div>
      </DsSection>

      <DsSection id="guidelines" title="Usage guidelines" intro="The interaction rules the trading UI is held to.">
        <div className="grid gap-4 lg:grid-cols-2">
          <DoDont
            tone="do"
            title="Do"
            items={[
              'Use autocomplete for symbol entry.',
              'Use structured inputs (dropdowns) whenever values are enumerable.',
              'Place inputs next to the data they control.',
              'Give feedback immediately — validate on blur, not on submit.',
            ]}
          />
          <DoDont
            tone="dont"
            title="Don’t"
            items={[
              'Rely on free text for structured data.',
              'Scatter filters across a layout or overload a toolbar.',
              'Delay feedback until after a form is submitted.',
              'Signal bullish/bearish with color alone.',
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen title="Placement — do" aside={<Check className="size-4 text-fg-bullish" />}>
            <div className="flex flex-col gap-3 rounded-md border border-semantic-success-200 bg-semantic-success-50 p-3">
              <div className="flex gap-2">
                <Input type="search" size="sm" placeholder="Symbol" aria-label="Symbol filter" containerClassName="w-40" />
                <Dropdown size="sm" className="w-40" aria-label="Expiry" value="30" onChange={() => {}} options={[{ label: '30 days', value: '30' }]} />
              </div>
              <p className="text-bodyMd text-fg-secondary">Filters sit directly above the table they filter.</p>
            </div>
          </Specimen>
          <Specimen title="Placement — don’t" aside={<X className="size-4 text-fg-bearish" />}>
            <div className="flex flex-col gap-3 rounded-md border border-semantic-red-200 bg-semantic-red-50 p-3">
              <Input size="sm" placeholder="Search by either symbol or name…" aria-label="Free text search" containerClassName="w-64" />
              <p className="text-bodyMd text-fg-secondary">Free text for structured data, far from the results it affects.</p>
            </div>
          </Specimen>
        </div>
      </DsSection>

      <DsSection id="accessibility" title="Accessibility" intro="WCAG 2.1 AA is a build-time constraint here, not a review step.">
        <Specimen title="Contrast verification" description="Ratios are computed in the browser from the live token values.">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-96 border-collapse text-left">
              <thead>
                <tr className="border-b border-line-subtle text-caption text-fg-tertiary">
                  <th scope="col" className="px-2 py-2 font-medium">Pair</th>
                  <th scope="col" className="px-2 py-2 font-medium">Sample</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Ratio</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">AA</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">AAA</th>
                </tr>
              </thead>
              <tbody>
                {contrast.map((c) => (
                  <tr key={c.pair} className="border-b border-line-subtle last:border-0">
                    <td className="px-2 py-2 text-bodyMd text-fg-secondary">{c.pair}</td>
                    <td className="px-2 py-2">
                      <span className="rounded-sm px-2 py-1 text-bodyMd" style={{ color: c.fg, backgroundColor: c.bg }}>
                        $251.08
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-bodyMd text-fg-primary tabular">{c.ratio}</td>
                    <td className={cn('px-2 py-2 text-right text-bodyMd font-medium', c.normalTextAA ? 'text-fg-bullish' : 'text-fg-bearish')}>
                      {c.normalTextAA ? 'Pass' : 'Fail'}
                    </td>
                    <td className={cn('px-2 py-2 text-right text-bodyMd', c.normalTextAAA ? 'text-fg-bullish' : 'text-fg-tertiary')}>
                      {c.normalTextAAA ? 'Pass' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Specimen>

        <Specimen title="Success criteria" description="How each one is met in this build.">
          <ul className="grid gap-3 md:grid-cols-2">
            {WCAG_CHECKS.map((c) => (
              <li key={c.id} className="flex gap-3 rounded-md border border-line-subtle p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-semantic-success-100 text-semantic-success-800" aria-hidden="true">
                  <Check className="size-3.5" />
                </span>
                <span>
                  <span className="block text-bodyLg font-medium text-fg-primary">
                    {c.id} {c.name}
                  </span>
                  <span className="block text-bodyMd text-fg-tertiary">{c.how}</span>
                </span>
              </li>
            ))}
          </ul>
        </Specimen>
      </DsSection>
    </>
  );
};
