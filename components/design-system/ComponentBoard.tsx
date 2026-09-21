'use client';

import React, { useState } from 'react';
import { Activity, ChevronRight, Home, Menu as MenuIcon, Search, Sparkles } from 'lucide-react';
import { DsSection, Specimen, StateGrid, CopyChip } from './parts';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/ui/BottomNav';
import { Button, IconButton, type ButtonVariant } from '@/components/ui/Button';
import { Calendar, toISODate, type DayStatus } from '@/components/ui/Calendar';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { Dropdown, Menu } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PriceChange } from '@/components/ui/PriceChange';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sparkline } from '@/components/ui/Sparkline';
import { SymbolSearch } from '@/components/ui/SymbolSearch';
import { Tabs } from '@/components/ui/Tabs';
import { Toggle } from '@/components/ui/Toggle';
import { Tooltip } from '@/components/ui/Tooltip';
import { getCreditSpreads } from '@/lib/market';

// Hover and pressed are normally produced by :hover/:active; here they are forced so the whole
// state matrix is reviewable at a glance.
const FORCED: Record<ButtonVariant, Record<string, string>> = {
  primary: { Hover: 'bg-action-primary-hover', Pressed: 'bg-action-primary-pressed' },
  secondary: { Hover: 'bg-brand-blue-50', Pressed: 'bg-brand-blue-100 border-brand-blue-700' },
  tertiary: { Hover: 'bg-brand-blue-50 text-brand-blue-800', Pressed: 'text-brand-blue-900' },
  danger: { Hover: 'bg-semantic-red-700', Pressed: 'bg-semantic-red-800' },
  ghost: { Hover: 'bg-surface-subtle', Pressed: 'bg-surface-muted' },
  brand: { Hover: 'bg-brand-green-400', Pressed: 'bg-brand-green-600' },
};

const SAMPLE_ROWS = getCreditSpreads().slice(0, 5);
const TABLE_COLUMNS: ColumnDef<(typeof SAMPLE_ROWS)[number]>[] = [
  { id: 'symbol', header: 'Symbol', accessor: (r) => r.symbol, sortable: true, cell: (r) => <span className="font-semibold">{r.symbol}</span> },
  { id: 'type', header: 'Type', cell: (r) => <Badge size="sm" variant={r.bias === 'Bullish' ? 'bullish' : 'bearish'}>{r.bias}</Badge> },
  { id: 'price', header: 'Price', align: 'right', accessor: (r) => r.price, sortable: true, cell: (r) => `$${r.price.toFixed(2)}` },
  { id: 'strike', header: 'Strike', align: 'right', accessor: (r) => r.sellStrike, sortable: true },
  { id: 'exp', header: 'Exp.', accessor: (r) => r.expiry },
  { id: 'prem', header: 'Premium', align: 'right', accessor: (r) => r.premium, sortable: true, cell: (r) => `$${r.premium.toFixed(2)}` },
  { id: 'change', header: 'Change', align: 'right', cell: (r) => <PriceChange value={r.premWidth - 33} size="sm" format="number" /> },
  { id: 'iv', header: 'IV', align: 'right', accessor: (r) => r.ivRank, cell: (r) => `${r.ivRank}%` },
  { id: 'score', header: 'Score', align: 'center', accessor: (r) => r.winRate, sortable: true, cell: (r) => <ScoreBadge score={r.winRate} size="sm" /> },
];

const calendarStatuses = (): Record<string, DayStatus> => {
  const base = new Date();
  const out: Record<string, DayStatus> = {};
  const pattern: DayStatus[] = ['hit', 'hit', 'missed', 'loss', 'hit', 'pending', 'hit'];
  for (let i = 0; i < 24; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out[toISODate(d)] = pattern[i % pattern.length];
  }
  return out;
};

export const ComponentBoard: React.FC = () => {
  const [toggles, setToggles] = useState({ on: true, off: false, small: true });
  const [tab, setTab] = useState('all');
  const [underline, setUnderline] = useState('overview');
  const [select, setSelect] = useState('vertical');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [navTab, setNavTab] = useState('home');
  const [statuses] = useState(calendarStatuses);

  return (
    <>
      <DsSection id="buttons" title="Buttons" intro="Body/Lg medium · 8px radius · 16/8 padding · flat by default. Hover and pressed states are shown forced, so every state is reviewable at a glance.">
        <Specimen title="Variants × states" description="Primary, Secondary and Tertiary cover 95% of the product. Danger is reserved for destructive actions.">
          <StateGrid
            states={['Default', 'Hover', 'Pressed', 'Disabled', 'Loading']}
            rows={(['primary', 'secondary', 'tertiary', 'danger', 'brand'] as ButtonVariant[]).map((variant) => ({
              label: variant[0].toUpperCase() + variant.slice(1),
              render: (state) => (
                <Button
                  variant={variant}
                  disabled={state === 'Disabled'}
                  loading={state === 'Loading'}
                  className={FORCED[variant][state]}
                >
                  Button CTA
                </Button>
              ),
            }))}
          />
        </Specimen>

        <div className="grid gap-4 md:grid-cols-2">
          <Specimen title="Sizes" description="sm 32px · md 36px · lg 44px (the minimum touch target)">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="md" iconLeading={<Sparkles className="size-4" />}>
                With icon
              </Button>
            </div>
          </Specimen>

          <Specimen title="Icon buttons" description="Icon-only controls always carry an accessible name and a tooltip.">
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip content="Search">
                <IconButton label="Search">
                  <Search className="size-4" aria-hidden="true" />
                </IconButton>
              </Tooltip>
              <IconButton label="Active state" active>
                <Activity className="size-4" aria-hidden="true" />
              </IconButton>
              <IconButton label="Disabled" disabled>
                <MenuIcon className="size-4" aria-hidden="true" />
              </IconButton>
              <Menu
                items={[
                  { label: 'Duplicate widget', onSelect: () => {} },
                  'divider',
                  { label: 'Remove widget', danger: true, onSelect: () => {} },
                ]}
                trigger={({ toggle, ...aria }) => (
                  <Button variant="secondary" size="sm" onClick={toggle} iconTrailing={<ChevronRight className="size-3.5" />} {...aria}>
                    Menu
                  </Button>
                )}
              />
            </div>
          </Specimen>
        </div>
      </DsSection>

      <DsSection id="forms" title="Form controls" intro="Structured inputs first: autocomplete for symbols, dropdowns for enumerated values, free text only when nothing else fits.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen title="Input states" description="Default · Hover · Focused · Disabled · Error">
            <div className="flex flex-col gap-3">
              <Input label="Text input" placeholder="Input text" value={text} onChange={(e) => setText(e.target.value)} onClear={() => setText('')} />
              <Input label="Disabled" placeholder="Input text" disabled />
              <Input label="With error" value={error} onChange={(e) => setError(e.target.value)} error="Enter a strike price above 0" />
              <Input type="search" placeholder="Search…" aria-label="Search" />
            </div>
          </Specimen>

          <Specimen title="Select & autocomplete" description="Symbol search is an ARIA combobox with keyboard navigation.">
            <div className="flex flex-col gap-3">
              <Dropdown
                label="Strategy"
                value={select}
                onChange={setSelect}
                options={[
                  { label: 'Long Call Vertical', value: 'vertical', description: 'Debit spread' },
                  { label: 'Bull Put Spread', value: 'bull-put', description: 'Credit spread' },
                  { label: 'Iron Condor', value: 'condor', description: 'Neutral' },
                ]}
              />
              <div>
                <span className="mb-1 block text-bodyMd font-medium text-fg-secondary">Symbol</span>
                <SymbolSearch onSelect={() => {}} />
              </div>
            </div>
          </Specimen>

          <Specimen title="Toggle" description="Default and Small, with loading and disabled states.">
            <div className="flex flex-col gap-3">
              <Toggle label="Stream live prices" checked={toggles.on} onChange={(v) => setToggles((t) => ({ ...t, on: v }))} description="Updates every 1.5s" />
              <Toggle label="Off state" checked={toggles.off} onChange={(v) => setToggles((t) => ({ ...t, off: v }))} />
              <Toggle size="sm" label="Small" checked={toggles.small} onChange={(v) => setToggles((t) => ({ ...t, small: v }))} />
              <Toggle label="Loading" checked loading onChange={() => {}} />
              <Toggle label="Disabled" checked={false} disabled onChange={() => {}} />
            </div>
          </Specimen>

          <Specimen title="Badges" description="Status is never carried by color alone — the label states it.">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Success</Badge>
              <Badge variant="bullish" dot>
                Bullish
              </Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="bearish" dot>
                Bearish
              </Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="new">New</Badge>
              <Badge variant="hot">Hot</Badge>
              <Badge size="sm" variant="bullish">
                Table size
              </Badge>
            </div>
          </Specimen>
        </div>
      </DsSection>

      <DsSection id="navigation" title="Navigation & progress" intro="Tabs use a roving tabindex; the bottom bar keeps every target at 44px for touch.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen title="Tabs" description="Segmented filters and underline navigation">
            <div className="flex flex-col items-start gap-4">
              <Tabs
                aria-label="Filter example"
                activeId={tab}
                onChange={setTab}
                items={[
                  { id: 'all', label: 'All', count: 23 },
                  { id: 'bull', label: 'Bull', count: 9 },
                  { id: 'bear', label: 'Bear', count: 14 },
                  { id: 'call', label: 'Call', count: 26 },
                  { id: 'put', label: 'Put', count: 19 },
                ]}
              />
              <Tabs
                variant="underline"
                aria-label="Section example"
                activeId={underline}
                onChange={setUnderline}
                items={[
                  { id: 'overview', label: 'Overview' },
                  { id: 'chain', label: 'Option chain' },
                  { id: 'risk', label: 'Risk' },
                ]}
              />
            </div>
          </Specimen>

          <Specimen title="Progress / steps" description="Scan → Analyze → Execute" aside={<CopyChip value="<ProgressSteps />" />}>
            <ProgressSteps
              current={step}
              onStepClick={setStep}
              steps={[
                { id: 'scan', label: 'Scan' },
                { id: 'analyze', label: 'Analyze' },
                { id: 'execute', label: 'Execute' },
              ]}
            />
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Back
              </Button>
              <Button size="sm" onClick={() => setStep((s) => Math.min(2, s + 1))}>
                Next
              </Button>
            </div>
          </Specimen>

          <Specimen title="Bottom navigation" description="Unselected · Selected · Pressed, with notification dot">
            <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-line-subtle">
              <BottomNav
                activeId={navTab}
                items={[
                  { id: 'home', label: 'Home', icon: <Home className="size-5" />, badge: true, onSelect: () => setNavTab('home') },
                  { id: 'progress', label: 'Progress', icon: <Activity className="size-5" />, onSelect: () => setNavTab('progress') },
                  { id: 'more', label: 'More', icon: <MenuIcon className="size-5" />, onSelect: () => setNavTab('more') },
                ]}
              />
            </div>
          </Specimen>

          <Specimen title="Overlays" description="Modal and drawer share one focus-trapped primitive.">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open dialog
            </Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Dialog title"
              description="Focus is trapped, Esc closes and focus returns to the trigger."
              footer={
                <>
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p className="text-bodyLg text-fg-secondary">Dialog body content.</p>
            </Modal>
          </Specimen>
        </div>
      </DsSection>

      <DsSection id="data" title="Data display" intro="Financial data uses tabular numerals so digits stay aligned as prices tick.">
        <Specimen title="Data table" description="Sortable headers, selectable rows, pagination footer">
          <DataTable columns={TABLE_COLUMNS} data={SAMPLE_ROWS} getRowId={(r) => r.id} pageSize={5} caption="Example option data" />
        </Specimen>

        <div className="grid gap-4 lg:grid-cols-3">
          <Specimen title="Calendar" description="Trade journal statuses">
            <Calendar title="" statuses={statuses} />
          </Specimen>
          <Specimen title="Scores & change" description="Score circles and signed values">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {[82, 68, 45, 30].map((s) => (
                  <ScoreBadge key={s} score={s} />
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <PriceChange value={2.41} percent={1.12} icon />
                <PriceChange value={-1.83} percent={-0.74} icon />
              </div>
              <Sparkline data={[4, 6, 5, 8, 7, 9, 12, 11, 14]} width={160} height={40} />
            </div>
          </Specimen>
          <Specimen title="Loading & empty" description="Every widget ships all four states">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="rounded-md border border-line-subtle">
                <EmptyState compact title="No results" description="Try another filter." />
              </div>
            </div>
          </Specimen>
        </div>
      </DsSection>
    </>
  );
};
