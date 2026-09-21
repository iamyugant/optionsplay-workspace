import { NextRequest, NextResponse } from 'next/server';
import { callTool, TOOL_DEFINITIONS } from '@/lib/mcp-tools';

// Model Context Protocol endpoint — JSON-RPC 2.0 over HTTP.
// POST {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_tokens"}}
export async function GET() {
  return NextResponse.json({
    name: 'optionsplay-design-system',
    version: '2.0.0',
    protocol: 'jsonrpc-2.0',
    tools: TOOL_DEFINITIONS.map((t) => t.name),
  });
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 });
  }

  const { id = null, method, params = {} } = body ?? {};

  try {
    switch (method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'optionsplay-design-system', version: '2.0.0' },
          },
        });

      case 'tools/list':
        return NextResponse.json({ jsonrpc: '2.0', id, result: { tools: TOOL_DEFINITIONS } });

      case 'tools/call': {
        if (!params.name) {
          return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32602, message: 'params.name is required' } }, { status: 400 });
        }
        return NextResponse.json({ jsonrpc: '2.0', id, result: callTool(params.name, params.arguments ?? {}) });
      }

      default:
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method “${method}” not found. Supported: initialize, tools/list, tools/call` },
          },
          { status: 404 }
        );
    }
  } catch (error) {
    return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32603, message: (error as Error).message } }, { status: 500 });
  }
}
