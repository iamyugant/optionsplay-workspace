import type { Config } from 'tailwindcss';
import tokens from './tokens/tokens.json';

/**
 * Every theme value below is derived from tokens/tokens.json and points at the CSS
 * custom property emitted by scripts/build-tokens.ts. Tailwind's default color palette
 * is intentionally replaced (not extended) so off-system colors like `gray-500`
 * cannot be used at all.
 */
type Group = Record<string, unknown>;
const isLeaf = (v: unknown) => !!v && typeof v === 'object' && 'value' in (v as object);

/** color-mix keeps opacity modifiers (`bg-surface-inverse/60`) working on CSS-variable colors. */
const colorVar = (name: string) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

function toVars(group: Group, prefix = ''): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(group).map(([key, val]) => {
      const name = prefix ? `${prefix}-${key}` : key;
      return [key, isLeaf(val) ? colorVar(name) : toVars(val as Group, name)];
    })
  );
}

const keysToVars = (group: Group, prefix: string) =>
  Object.fromEntries(Object.keys(group).map((k) => [k, `var(--${prefix}-${k})`]));

const fontSize = Object.fromEntries(
  Object.keys(tokens.typography.scale).map((name) => [
    name,
    [
      `var(--font-size-${name})`,
      {
        lineHeight: `var(--line-height-${name})`,
        letterSpacing: `var(--letter-spacing-${name})`,
        fontWeight: `var(--font-weight-${name})`,
      },
    ],
  ])
) as unknown as NonNullable<Config['theme']>['fontSize'];

const config: Config = {
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: colorVar('semantic-neutral-0'),
      brand: toVars(tokens.color.brand, 'brand'),
      semantic: toVars(tokens.color.semantic, 'semantic'),
      ...toVars(tokens.color.alias),
    } as NonNullable<Config['theme']>['colors'],
    fontSize,
    extend: {
      spacing: keysToVars(tokens.spatial.spacing, 'space'),
      borderRadius: keysToVars(tokens.spatial.radius, 'radius'),
      boxShadow: Object.fromEntries(
        Object.keys(tokens.spatial.elevation).map((k) => [k.replace('level', 'elevation-'), `var(--elevation-${k})`])
      ),
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      transitionDuration: keysToVars(tokens.motion.duration, 'duration'),
      transitionTimingFunction: keysToVars(tokens.motion.easing, 'easing'),
      minHeight: { touch: 'var(--touch-target-min)' },
      minWidth: { touch: 'var(--touch-target-min)' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'none' } },
        'flash-up': { '0%': { backgroundColor: 'var(--semantic-success-100)' }, '100%': { backgroundColor: 'transparent' } },
        'flash-down': { '0%': { backgroundColor: 'var(--semantic-red-100)' }, '100%': { backgroundColor: 'transparent' } },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-base) var(--easing-standard)',
        'slide-up': 'slide-up var(--duration-base) var(--easing-standard)',
        'slide-in-right': 'slide-in-right var(--duration-slow) var(--easing-standard)',
        'scale-in': 'scale-in var(--duration-base) var(--easing-standard)',
        'flash-up': 'flash-up 900ms var(--easing-standard)',
        'flash-down': 'flash-down 900ms var(--easing-standard)',
      },
    },
  },
  plugins: [],
};

export default config;
