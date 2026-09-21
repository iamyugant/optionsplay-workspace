// Guardrail: fails the build when UI code bypasses the design tokens.
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'lib', 'store'];
const IGNORE = [/app\/api\//];

const RULES: { name: string; pattern: RegExp }[] = [
  { name: 'raw hex color', pattern: /(?<![\w&])#[0-9a-fA-F]{3,8}\b(?![\w-])/g },
  { name: 'raw rgb/hsl color', pattern: /\b(?:rgba?|hsla?)\(/g },
  { name: 'arbitrary color class', pattern: /\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline)-\[(?:#|rgb|hsl)/g },
  { name: 'arbitrary font size', pattern: /\btext-\[\d+(?:\.\d+)?px\]/g },
  {
    name: 'Tailwind default palette',
    pattern: /\b(?:bg|text|border|ring|fill|stroke|divide)-(?:gray|slate|zinc|stone|red|orange|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose)-\d{2,3}\b/g,
  },
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx?|css)$/.test(entry.name) ? [full] : [];
  });
}

const violations: string[] = [];
for (const file of SCAN_DIRS.flatMap((d) => walk(path.join(root, d)))) {
  const rel = path.relative(root, file);
  if (IGNORE.some((re) => re.test(rel))) continue;
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('tokens-ignore')) return;
    for (const rule of RULES) {
      for (const match of line.matchAll(rule.pattern)) {
        violations.push(`${rel}:${i + 1}  ${rule.name}: ${match[0]}`);
      }
    }
  });
}

if (violations.length) {
  console.error(`✗ ${violations.length} token violation(s):\n` + violations.map((v) => '  ' + v).join('\n'));
  process.exit(1);
}
console.log('✓ No hardcoded colors or font sizes — all UI styles resolve to design tokens.');
