'use client';

import React, { useState } from 'react';
import tokens from '@/tokens/tokens.json';
import { cn, getContrastRatio } from '@/lib/utils';
import { CopyChip, DsSection, Specimen } from './parts';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';

type Leaf = { value: string; description?: string };

const WHITE = tokens.color.semantic.neutral['0'].value;

const SCALES: { name: string; group: Record<string, Leaf>; prefix: string; note: string }[] = [
  { name: 'Brand / Blue', group: tokens.color.brand.blue as Record<string, Leaf>, prefix: 'brand-blue', note: 'Primary interactive color. 600 is the CTA default.' },
  { name: 'Brand / Green', group: tokens.color.brand.green as Record<string, Leaf>, prefix: 'brand-green', note: 'OptionsPlay lime. Pair 500 with Neutral/900 text, or use 700 under white text.' },
  { name: 'Semantic / Success', group: tokens.color.semantic.success as Record<string, Leaf>, prefix: 'semantic-success', note: 'Bullish signals, win rates, positive P&L.' },
  { name: 'Semantic / Red', group: tokens.color.semantic.red as Record<string, Leaf>, prefix: 'semantic-red', note: 'Bearish signals, risk and destructive actions.' },
  { name: 'Semantic / Amber', group: tokens.color.semantic.amber as Record<string, Leaf>, prefix: 'semantic-amber', note: 'Warnings, open positions, “hot” tags.' },
  { name: 'Semantic / Neutral', group: tokens.color.semantic.neutral as Record<string, Leaf>, prefix: 'semantic-neutral', note: 'Surfaces, borders and text.' },
];

const ALIASES = [
  ['fg', tokens.color.alias.fg],
  ['surface', tokens.color.alias.surface],
  ['line', tokens.color.alias.line],
  ['action', tokens.color.alias.action],
] as const;

const TYPE_CLASS: Record<string, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  bodyLg: 'text-bodyLg',
  bodyMd: 'text-bodyMd',
  caption: 'text-caption',
  overline: 'text-overline',
};

const TYPE_SAMPLE: Record<string, string> = {
  display: 'Display',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  bodyLg: 'Body / Large',
  bodyMd: 'Body / Medium',
  caption: 'Caption',
  overline: 'Overline',
};

export const Foundations: React.FC = () => {
  const [dynamicSize, setDynamicSize] = useState<string>('default');
  const matrix = tokens.typography.dynamicMatrix as Record<string, { fontSize: Leaf; lineHeight: Leaf }>;

  return (
    <>
      <DsSection
        id="color"
        title="Color"
        intro="Six scales, each generated from tokens.json. Every swatch shows its contrast against white — the pairs used for text all clear WCAG 2.1 AA (4.5:1)."
      >
        {SCALES.map((scale) => (
          <Specimen key={scale.name} title={scale.name} description={scale.note}>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
              {Object.entries(scale.group)
                .filter(([shade]) => shade !== '0')
                .map(([shade, leaf]) => {
                  const ratio = getContrastRatio(leaf.value, WHITE);
                  const onDark = ratio >= 3;
                  return (
                    <li key={shade} className="flex flex-col gap-1">
                      <div
                        className="flex h-16 items-end justify-between rounded-md border border-line-subtle p-1.5"
                        style={{ backgroundColor: leaf.value }}
                        title={leaf.description}
                      >
                        <span className={cn('text-overline', onDark ? 'text-white' : 'text-semantic-neutral-900')}>{shade}</span>
                        <span className={cn('text-overline tabular', onDark ? 'text-white' : 'text-semantic-neutral-900')}>{ratio}</span>
                      </div>
                      <CopyChip value={`--${scale.prefix}-${shade}`} className="justify-center" />
                    </li>
                  );
                })}
            </ul>
          </Specimen>
        ))}

        <Specimen
          title="Semantic aliases"
          description="Components never reference a raw scale. They use function-named aliases, so a palette change flows through the whole product."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALIASES.map(([group, values]) => (
              <div key={group}>
                <h4 className="mb-2 text-overline text-fg-tertiary">{group}</h4>
                <ul className="flex flex-col gap-1.5">
                  {Object.entries(values as Record<string, Leaf>).map(([name, leaf]) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className="size-5 shrink-0 rounded-sm border border-line-subtle" style={{ background: `var(--${group}-${name})` }} aria-hidden="true" />
                      <CopyChip value={`--${group}-${name}`} />
                      <span className="truncate text-caption text-fg-tertiary">{leaf.value.replace(/[{}]|color\./g, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Specimen>
      </DsSection>

      <DsSection id="typography" title="Typography" intro="Inter, nine steps, each carrying its own size, line height, weight and tracking as a single Tailwind class.">
        <Specimen title="Type scale" description="Class names map 1:1 to the Figma text styles.">
          <ul className="flex flex-col divide-y divide-line-subtle">
            {Object.entries(tokens.typography.scale).map(([name, def]) => (
              <li key={name} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                <span className={cn(TYPE_CLASS[name], 'text-fg-primary')}>{TYPE_SAMPLE[name] ?? name}</span>
                <span className="flex items-center gap-3 text-caption text-fg-tertiary tabular">
                  <span>
                    {(def as any).fontSize.value} / {(def as any).lineHeight.value} · {(def as any).fontWeight.value}
                  </span>
                  <CopyChip value={`text-${name}`} />
                </span>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen
          title="Dynamic type sizing"
          description="Body text scales with the reader’s preference, from XSmall to XXXLarge, without breaking the 8pt rhythm."
          aside={
            <Dropdown
              size="sm"
              aria-label="Dynamic type size"
              className="w-40"
              value={dynamicSize}
              onChange={setDynamicSize}
              options={Object.keys(matrix).map((k) => ({ label: k, value: k }))}
            />
          }
        >
          <div className="flex flex-col gap-3">
            <p
              className="max-w-2xl text-fg-secondary"
              style={{ fontSize: `var(--dynamic-type-${dynamicSize}-size)`, lineHeight: `var(--dynamic-type-${dynamicSize}-lh)` }}
            >
              AAPL is in a bearish trend with support at $246.48. Implied volatility rank sits at 24%, so debit strategies screen better than credit spreads today.
            </p>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(matrix).map(([name, def]) => (
                <li key={name}>
                  <Badge variant={name === dynamicSize ? 'info' : 'neutral'}>
                    {name} {def.fontSize.value}/{def.lineHeight.value}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Specimen>
      </DsSection>

      <DsSection id="space" title="Space, radius & elevation" intro="An 8pt base grid with a 4px half-step. Cards are flat by default; elevation only signals layering.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Specimen title="Spacing" description="8pt grid">
            <ul className="flex flex-col gap-2">
              {Object.entries(tokens.spatial.spacing)
                .filter(([k]) => k !== '0')
                .map(([name, leaf]) => (
                  <li key={name} className="flex items-center gap-3">
                    <span className="h-3 rounded-sm bg-brand-blue-300" style={{ width: (leaf as Leaf).value }} aria-hidden="true" />
                    <span className="text-caption text-fg-tertiary tabular">{(leaf as Leaf).value}</span>
                    <CopyChip value={`p-${name}`} className="ml-auto" />
                  </li>
                ))}
            </ul>
          </Specimen>

          <Specimen title="Radius" description="Md (8px) is the product default">
            <ul className="grid grid-cols-2 gap-3">
              {Object.entries(tokens.spatial.radius).map(([name, leaf]) => (
                <li key={name} className="flex flex-col items-center gap-1">
                  <span className="size-14 border-2 border-brand-blue-400 bg-brand-blue-50" style={{ borderRadius: (leaf as Leaf).value }} aria-hidden="true" />
                  <CopyChip value={`rounded-${name}`} />
                </li>
              ))}
            </ul>
          </Specimen>

          <Specimen title="Elevation" description="Level 0 is flat — the default for cards">
            <ul className="flex flex-col gap-3">
              {Object.entries(tokens.spatial.elevation).map(([name, leaf]) => (
                <li key={name} className="flex items-center gap-3 rounded-md border border-line-subtle bg-surface-default p-3" style={{ boxShadow: (leaf as Leaf).value }}>
                  <CopyChip value={`shadow-elevation-${name.replace('level', '')}`} />
                  <span className="text-caption text-fg-tertiary">{(leaf as Leaf).description}</span>
                </li>
              ))}
            </ul>
          </Specimen>
        </div>

        <Specimen title="Motion" description="Two durations and one easing curve cover almost every transition.">
          <ul className="flex flex-wrap gap-6">
            {Object.entries(tokens.motion.duration).map(([name, leaf]) => (
              <li key={name} className="group flex items-center gap-3">
                <span
                  className="block h-2 w-16 rounded-full bg-surface-muted"
                  aria-hidden="true"
                >
                  <span
                    className="block h-2 w-4 rounded-full bg-action-primary transition-transform ease-standard group-hover:translate-x-12"
                    style={{ transitionDuration: (leaf as Leaf).value }}
                  />
                </span>
                <CopyChip value={`duration-${name}`} />
                <span className="text-caption text-fg-tertiary tabular">{(leaf as Leaf).value}</span>
              </li>
            ))}
          </ul>
        </Specimen>
      </DsSection>
    </>
  );
};
