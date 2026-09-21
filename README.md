# OptionsPlay — Trading Workspace & Design System

A production-shaped prototype of the OptionsPlay trading workspace, built on a token-first design
system. Next.js 14 · TypeScript · Tailwind (token-driven theme) · Zustand · Model Context Protocol.

**Live: [iamyugant.github.io/optionsplay-workspace](https://iamyugant.github.io/optionsplay-workspace/)**

```bash
npm install
npm run dev          # http://localhost:3000
```

| Route            | What it is                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| `/`              | Landing page, implemented from the Figma “Your Smarter Trading Workspace” frame |
| `/dashboard`     | The workspace: modular widgets, layout builder, draft → publish flow         |
| `/design-system` | Living documentation: tokens, components, guidelines, a11y record, MCP console |
| `/api/mcp`       | JSON-RPC 2.0 endpoint exposing the design system to AI agents                 |

---

## 1. One token source

`tokens/tokens.json` is the only place a color, size or duration is defined. `npm run build:tokens`
compiles it into:

- `styles/tokens.css` — CSS custom properties, including semantic aliases that reference primitives
- `types/tokens.ts` — union types for every token name
- Tailwind theme values — `tailwind.config.ts` reads the JSON directly, so classes can never drift

Tailwind's **default palette is replaced, not extended**: `bg-gray-500` does not exist. Components use
function-named aliases (`bg-surface-default`, `text-fg-tertiary`, `border-line-subtle`,
`bg-action-primary`) so a re-theme is a single-file change.

```bash
npm run lint:tokens   # fails the build on raw hex, rgb(), arbitrary colors or default-palette classes
```

The rebuild started from **966 violations** in the previous codebase and now reports **0**.

### Scales

| Scale              | Role                                                      |
| ------------------ | --------------------------------------------------------- |
| Brand / Blue       | Primary interactive — `600` is the CTA (7.7:1 on white)   |
| Brand / Green      | OptionsPlay lime, used on marketing surfaces              |
| Semantic / Success | Bullish signals, win rates, positive P&L                  |
| Semantic / Red     | Bearish signals, risk, destructive actions                |
| Semantic / Amber   | Warnings, open positions                                  |
| Semantic / Neutral | Surfaces, borders, text                                   |

Type scale: Display 48/56 · H1 32/40 · H2 24/32 · H3 20/28 · H4 16/24 · Body/Lg 14/20 · Body/Md 13/20 ·
Caption 12/16 · Overline 11/16, plus a dynamic-type matrix (XSmall → XXXLarge). Spacing is an 8pt grid
with a 4px half step; cards are flat (elevation 0) and elevation only signals layering.

## 2. Component library

`components/ui/` — Button/IconButton, Input, Dropdown/Menu, SymbolSearch (ARIA combobox), Toggle,
Badge, Tabs, DataTable, Calendar, ProgressSteps, ScoreBadge, PriceChange, Sparkline, Modal/Drawer,
Tooltip, Toaster, BottomNav, Accordion, Skeleton, EmptyState.

Accessibility is built in rather than audited afterwards:

- one focus-ring token on every interactive element (2.4.7)
- icon-only buttons require a `label` prop — it is a TypeScript error to omit it (4.1.2)
- roving tabindex on tabs, full keyboard support in menus, dropdowns and the calendar (2.1.1)
- focus trap, Esc and focus restore in every overlay
- bullish/bearish values carry a sign and an arrow, never color alone (1.4.1)
- 44px minimum touch targets; `prefers-reduced-motion` collapses transitions

## 3. Dashboard builder

`components/dashboard/` + `components/widgets/`

- **Multiple dashboards** as tabs — create, rename (double-click), duplicate (fork), close
- **Widget library** — searchable, drag onto the canvas or click to append
- **Layout editing** — drag to reorder, drag edges to resize (1–4 columns, height snapped to 8px),
  or `Alt` + arrow keys for the same result from the keyboard
- **State flow** — unsaved → Save (draft) → Publish (live), with Discard to revert
- **Undo/redo** (⌘Z / ⇧⌘Z), **copy/paste** (⌘C / ⌘V), delete, 8pt grid overlay, fit-to-width
- **Device preview** — desktop / tablet / mobile column behavior
- Layouts persist to `localStorage`; the store rehydrates after mount so SSR markup always matches

Widgets: Technical Analysis, Credit Spreads, Top Strategies, Quote Board, Trade Ideas, Income
Screener, DailyPlay Journal. Each one renders through `WidgetShell`, which supplies the
header / control bar / body / footer anatomy and the loading, error, empty, locked and content states.

Market data (`lib/market.ts`) is deterministic — seeded per symbol, so server and client agree — and
`store/marketStore.ts` streams simulated ticks from a single interval to every widget at once.

## 4. MCP handoff

`lib/mcp-tools.ts` backs both transports:

```bash
npm run mcp:server                                    # stdio, for CLI agents
curl -s localhost:3000/api/mcp \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' # HTTP, for web agents
```

| Tool                        | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `get_tokens`                | Every token, or one group (color/typography/spatial/motion) |
| `get_component_spec`        | Props, variants, states and tokens for a component         |
| `check_wcag_contrast`       | Ratio + AA/AAA verdict for two colors                      |
| `validate_component_syntax` | Flags hardcoded colors, raw `<button>`/`<input>`, arbitrary sizes |

The `/design-system` page includes a live console for these calls.

## 5. Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Compile tokens, then start the dev server        |
| `npm run build`        | Tokens → token guardrail → production build      |
| `npm run build:tokens` | Regenerate CSS variables and TypeScript types    |
| `npm run lint:tokens`  | Fail on any hardcoded color or font size         |
| `npm run typecheck`    | `tsc --noEmit`                                   |
| `npm run mcp:server`   | Stdio MCP server                                 |

## 6. Deploy

Every push to `main` publishes a static export to GitHub Pages via `.github/workflows/deploy-pages.yml`.
Pages has no Node runtime, so `/api/mcp` is left out of that build and the MCP console says so —
run the app locally or deploy to Vercel for the live endpoint.

Vercel builds this with zero configuration — `npm run build` compiles the tokens, runs the token
guardrail and then builds Next.js, so a hardcoded color fails the deploy rather than shipping.

```bash
npx vercel          # preview deploy
npx vercel --prod   # production
```

Or import the repository at [vercel.com/new](https://vercel.com/new) to deploy on every push.
