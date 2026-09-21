// Stdio MCP server (`npm run mcp:server`): JSON-RPC 2.0 over stdin/stdout for CLI agents.
import readline from 'readline';
import { callTool, TOOL_DEFINITIONS } from '../lib/mcp-tools';

const rl = readline.createInterface({ input: process.stdin, terminal: false });

const send = (payload: unknown) => process.stdout.write(JSON.stringify(payload) + '\n');

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let message: any;
  try {
    message = JSON.parse(trimmed);
  } catch {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }

  const { id = null, method, params = {} } = message;

  try {
    if (method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'optionsplay-design-system', version: '2.0.0' },
        },
      });
    } else if (method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: TOOL_DEFINITIONS } });
    } else if (method === 'tools/call') {
      send({ jsonrpc: '2.0', id, result: callTool(params.name, params.arguments ?? {}) });
    } else if (method !== 'notifications/initialized') {
      send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method “${method}” not found` } });
    }
  } catch (error) {
    send({ jsonrpc: '2.0', id, error: { code: -32603, message: (error as Error).message } });
  }
});

process.stderr.write('OptionsPlay MCP server ready (stdio)\n');
