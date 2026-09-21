import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'OptionsPlay — Your Smarter Trading Workspace',
    template: '%s · OptionsPlay',
  },
  description:
    'A redesigned, customizable options trading dashboard built on a token-first design system with 50+ components.',
  icons: { icon: '/brand/optionsplay-logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-canvas font-sans text-fg-primary antialiased">{children}</body>
    </html>
  );
}
