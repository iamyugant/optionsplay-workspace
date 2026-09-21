// Tool implementations shared by the HTTP route (app/api/mcp) and the stdio server.
import fs from 'fs';
import path from 'path';
import { checkWcagCompliance, getContrastRatio } from './utils';

const root = process.cwd();
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.resolve(root, rel), 'utf-8'));

export const TOOL_DEFINITIONS = [
  {
    name: 'get_tokens',
    description: 'Return OptionsPlay design tokens. Optionally narrow to one group: color, typography, spatial or motion.',
    inputSchema: {
      type: 'object',
      properties: { group: { type: 'string', enum: ['color', 'typography', 'spatial', 'motion'] } },
    },
  },
  {
    name: 'get_component_spec',
    description: 'Return the props, variants, states and tokens for a component in the library.',
    inputSchema: {
      type: 'object',
      properties: { component: { type: 'string' } },
      required: ['component'],
    },
  },
  {
    name: 'check_wcag_contrast',
    description: 'Compute the contrast ratio between two hex colors and report WCAG 2.1 AA/AAA results.',
    inputSchema: {
      type: 'object',
      properties: { foreground: { type: 'string' }, background: { type: 'string' } },
      required: ['foreground', 'background'],
    },
  },
  {
    name: 'validate_component_syntax',
    description: 'Check a snippet of UI code against the design-system guardrails (no hardcoded colors, reuse primitives, label icon buttons).',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: ['code'],
    },
  },
];

const COMPONENT_SPECS: Record<string, unknown> = {
  Button: {
    import: "import { Button } from '@/components/ui/Button'",
    variants: ['primary', 'secondary', 'tertiary', 'danger', 'ghost', 'brand'],
    sizes: { sm: '32px', md: '36px', lg: '44px' },
    states: ['default', 'hover', 'pressed', 'disabled', 'loading'],
    tokens: ['--action-primary', '--action-primary-hover', '--action-primary-pressed', '--radius-md', '--font-size-bodyLg'],
    rules: ['Never nest a <button> inside a Button.', 'Icon-only buttons must use IconButton with a label prop.'],
  },
  Input: {
    import: "import { Input } from '@/components/ui/Input'",
    props: ['label', 'helperText', 'error', 'iconLeading', 'onClear', 'size'],
    states: ['default', 'hover', 'focused', 'disabled', 'error'],
    tokens: ['--line-default', '--line-focus', '--surface-default', '--fg-disabled'],
    rules: ['Use SymbolSearch for tickers and Dropdown for enumerable values instead of free text.'],
  },
  Badge: {
    import: "import { Badge } from '@/components/ui/Badge'",
    variants: ['bullish', 'success', 'bearish', 'warning', 'hot', 'neutral', 'info', 'new', 'brand'],
    rules: ['Status must be readable without color — keep the text label.'],
  },
  DataTable: {
    import: "import { DataTable } from '@/components/ui/DataTable'",
    props: ['columns', 'data', 'getRowId', 'pageSize', 'onRowClick', 'loading'],
    rules: ['Numeric columns align right and use the `tabular` class.', 'Sortable headers expose aria-sort.'],
  },
  WidgetShell: {
    import: "import { WidgetShell } from '@/components/widgets/WidgetShell'",
    slots: ['header', 'controlBar', 'body', 'footer'],
    states: ['loading', 'error', 'empty', 'locked', 'content'],
    rules: ['Every dashboard widget must render through WidgetShell so states and resizing stay consistent.'],
  },
  Toggle: {
    import: "import { Toggle } from '@/components/ui/Toggle'",
    sizes: ['sm', 'md'],
    states: ['on', 'off', 'loading', 'disabled'],
  },
};

interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

const text = (data: unknown): ToolResult => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] });

export function callTool(name: string, args: Record<string, any> = {}): ToolResult {
  switch (name) {
    case 'get_tokens': {
      const tokens = readJson('tokens/tokens.json');
      const group = args.group as string | undefined;
      return text(group ? { [group]: tokens[group] } : tokens);
    }

    case 'get_component_spec': {
      const spec = COMPONENT_SPECS[args.component];
      return spec
        ? text({ component: args.component, ...(spec as object) })
        : text({ error: `Unknown component “${args.component}”.`, available: Object.keys(COMPONENT_SPECS) });
    }

    case 'check_wcag_contrast': {
      const ratio = getContrastRatio(args.foreground, args.background);
      return text({ foreground: args.foreground, background: args.background, ratio, ...checkWcagCompliance(ratio) });
    }

    case 'validate_component_syntax': {
      const code = String(args.code ?? '');
      const issues: string[] = [];
      if (/#[0-9a-fA-F]{3,8}\b/.test(code)) issues.push('Hardcoded hex color — use a token (e.g. bg-action-primary or var(--action-primary)).');
      if (/\b(?:rgba?|hsla?)\(/.test(code)) issues.push('Hardcoded rgb()/hsl() color — use a token.'); // tokens-ignore: validator pattern
      if (/-(gray|slate|blue|red|green|amber|yellow)-\d{2,3}\b/.test(code)) issues.push('Tailwind default palette is disabled — use brand/semantic/alias colors.');
      if (/<button/.test(code) && !/from '@\/components\/ui\/Button'/.test(code)) issues.push('Raw <button> — import Button or IconButton instead.');
      if (/<input/.test(code) && !/components\/ui\/(Input|SymbolSearch)/.test(code)) issues.push('Raw <input> — import Input or SymbolSearch instead.');
      if (/text-\[\d+px\]/.test(code)) issues.push('Arbitrary font size — use a type token (text-h4, text-bodyLg, …).');
      return text({ valid: issues.length === 0, issues, checked: code.length });
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool “${name}”. Available: ${TOOL_DEFINITIONS.map((t) => t.name).join(', ')}` }], isError: true };
  }
}
