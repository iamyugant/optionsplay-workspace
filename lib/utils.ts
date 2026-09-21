import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import tokens from '@/tokens/tokens.json';

// Our font-size scale is custom, so tailwind-merge needs to be told about it —
// otherwise `text-caption` and `text-fg-primary` land in the same group and one gets dropped.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(tokens.typography.scale) }],
      shadow: [{ shadow: ['elevation-0', 'elevation-1', 'elevation-2', 'elevation-3'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCurrency = (n: number) => usd.format(n);
export const formatCompact = (n: number) => compact.format(n);

// Mock data is generated from a seed so the server and client render the same numbers.
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const TOKEN_COUNT = countTokens(tokens as unknown as Record<string, unknown>);

function countTokens(group: Record<string, unknown>): number {
  return Object.values(group).reduce<number>((total, value) => {
    if (!value || typeof value !== 'object') return total;
    return total + ('value' in value ? 1 : countTokens(value as Record<string, unknown>));
  }, 0);
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const channel = (i: number) => {
    const c = parseInt(clean.substring(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function getContrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2));
}

export function checkWcagCompliance(ratio: number) {
  return {
    normalTextAA: ratio >= 4.5,
    largeTextAA: ratio >= 3,
    uiComponentAA: ratio >= 3,
    normalTextAAA: ratio >= 7,
    largeTextAAA: ratio >= 4.5,
  };
}
