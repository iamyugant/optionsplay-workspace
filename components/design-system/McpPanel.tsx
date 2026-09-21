'use client';

import React, { useState } from 'react';
import { Play, Terminal } from 'lucide-react';
import { DsSection, Specimen } from './parts';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import tokens from '@/tokens/tokens.json';

const WHITE = tokens.color.semantic.neutral['0'].value;
const BLUE_600 = tokens.color.brand.blue['600'].value;

const TOOLS = [
  { value: 'get_tokens', label: 'get_tokens', description: 'Return every design token as JSON' },
  { value: 'get_component_spec', label: 'get_component_spec', description: 'Props, states and tokens for one component' },
  { value: 'check_wcag_contrast', label: 'check_wcag_contrast', description: 'Contrast ratio + AA/AAA verdict for two colors' },
  { value: 'validate_component_syntax', label: 'validate_component_syntax', description: 'Flag hardcoded colors and raw HTML controls' },
];

const SAMPLE_ARGS: Record<string, string> = {
  get_tokens: '{ "group": "color" }',
  get_component_spec: '{ "component": "Button" }',
  check_wcag_contrast: `{ "foreground": "${WHITE}", "background": "${BLUE_600}" }`,
  validate_component_syntax: `{ "code": "<button className=\\"bg-[${BLUE_600}]\\">Buy</button>" }`,
};

export const McpPanel: React.FC = () => {
  const [tool, setTool] = useState('get_tokens');
  const [args, setArgs] = useState(SAMPLE_ARGS.get_tokens);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: tool, arguments: JSON.parse(args || '{}') } }),
      });
      // The static GitHub Pages build has no Node runtime, so the endpoint 404s there.
      if (!res.ok) {
        setResult(
          `This is the static preview, so the endpoint isn’t running.\n\nClone the repo and run "npm run dev" for the HTTP tools, or "npm run mcp:server" for stdio.`
        );
        return;
      }
      setResult(JSON.stringify(await res.json(), null, 2).slice(0, 4000));
    } catch (e) {
      setResult(`Request failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DsSection
      id="mcp"
      title="MCP handoff"
      intro="The design system is queryable over Model Context Protocol, so an AI agent can read tokens and validate generated UI instead of guessing."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Specimen title="Try a tool call" description="POST /api/mcp · JSON-RPC 2.0">
          <div className="flex flex-col gap-3">
            <Dropdown
              label="Tool"
              value={tool}
              onChange={(v) => {
                setTool(v);
                setArgs(SAMPLE_ARGS[v] ?? '{}');
                setResult('');
              }}
              options={TOOLS}
            />
            <Input label="Arguments (JSON)" value={args} onChange={(e) => setArgs(e.target.value)} className="font-mono" />
            <Button variant="primary" loading={loading} iconLeading={<Play className="size-4" />} onClick={run} className="self-start">
              Run tool
            </Button>
            {result && (
              <pre className="max-h-72 overflow-auto rounded-md bg-surface-inverse p-3 font-mono text-caption text-fg-inverse scrollbar-thin" aria-live="polite">
                {result}
              </pre>
            )}
          </div>
        </Specimen>

        <Specimen title="Connect an agent" description="Stdio server for CLI agents, HTTP for web agents" aside={<Badge variant="info">4 tools</Badge>}>
          <div className="flex flex-col gap-3">
            <pre className="overflow-x-auto rounded-md bg-surface-inverse p-3 font-mono text-caption text-fg-inverse scrollbar-thin">{`npm run mcp:server        # stdio transport
curl -s localhost:3000/api/mcp \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</pre>
            <ul className="flex flex-col gap-2">
              {TOOLS.map((t) => (
                <li key={t.value} className="flex items-start gap-2 rounded-md border border-line-subtle p-2.5">
                  <Terminal className="mt-0.5 size-4 shrink-0 text-fg-tertiary" aria-hidden="true" />
                  <span>
                    <span className="block font-mono text-bodyMd text-fg-primary">{t.label}</span>
                    <span className="block text-caption text-fg-tertiary">{t.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Specimen>
      </div>
    </DsSection>
  );
};
