'use client';

import React from 'react';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { AskOptionsPlayDrawer } from '@/components/dashboard/AskOptionsPlayDrawer';
import { Toaster } from '@/components/ui/Toaster';
import { Badge } from '@/components/ui/Badge';
import { Foundations } from './Foundations';
import { ComponentBoard } from './ComponentBoard';
import { Guidelines } from './Guidelines';
import { McpPanel } from './McpPanel';
import { cn, focusRing, TOKEN_COUNT } from '@/lib/utils';
import tokens from '@/tokens/tokens.json';

const NAV = [
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Typography' },
  { id: 'space', label: 'Space & elevation' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Form controls' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'data', label: 'Data display' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'mcp', label: 'MCP handoff' },
];

export const DesignSystemPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 py-8">
        <nav aria-label="Design system sections" className="sticky top-20 hidden h-fit w-48 shrink-0 flex-col gap-0.5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn('rounded-md px-3 py-1.5 text-bodyLg text-fg-secondary transition-colors hover:bg-surface-subtle hover:text-fg-primary', focusRing)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main className="flex min-w-0 flex-1 flex-col gap-10">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Design system v{tokens.version}</Badge>
              <Badge variant="info">{TOKEN_COUNT} tokens</Badge>
              <Badge variant="success" dot>
                WCAG 2.1 AA
              </Badge>
            </div>
            <h1 className="max-w-3xl text-display text-fg-primary">One system behind every OptionsPlay surface</h1>
            <p className="max-w-3xl text-h4 font-normal text-fg-secondary">
              Twelve years of UI fragmentation, replaced by a single token source that compiles to CSS variables, Tailwind theme values and
              TypeScript types — with a build step that fails on any hardcoded color.
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ['Token source', 'tokens/tokens.json', 'One file feeds design, code and the MCP server.'],
                  ['Guardrail', 'npm run lint:tokens', 'Blocks raw hex, rgb() and off-system Tailwind colors.'], // tokens-ignore: documentation copy
                  ['Handoff', 'POST /api/mcp', 'Agents read tokens and validate components.'],
                ] as const
              ).map(([term, value, note]) => (
                <div key={term} className="rounded-lg border border-line-subtle bg-surface-default p-4">
                  <dt className="text-overline text-fg-tertiary">{term}</dt>
                  <dd className="font-mono text-bodyLg text-fg-primary">{value}</dd>
                  <dd className="mt-1 text-bodyMd text-fg-tertiary">{note}</dd>
                </div>
              ))}
            </dl>
          </header>

          <Foundations />
          <ComponentBoard />
          <Guidelines />
          <McpPanel />
        </main>
      </div>

      <AskOptionsPlayDrawer />
      <Toaster />
    </div>
  );
};
