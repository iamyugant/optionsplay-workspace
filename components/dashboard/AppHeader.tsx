'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Sparkles } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SymbolSearch } from '@/components/ui/SymbolSearch';
import { useDashboardStore } from '@/store/dashboardStore';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/design-system', label: 'Design System', icon: <Palette className="size-3.5" /> },
];

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const activeSymbol = useDashboardStore((s) => s.activeSymbol);
  const setActiveSymbol = useDashboardStore((s) => s.setActiveSymbol);
  const setAiOpen = useDashboardStore((s) => s.setAiOpen);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-line-subtle bg-surface-default px-4">
      <Link href="/" className={cn('flex shrink-0 items-center rounded-sm', focusRing)} aria-label="OptionsPlay home">
        <Image src="/brand/optionsplay-logo.png" alt="OptionsPlay" width={120} height={75} className="h-8 w-auto" priority />
      </Link>

      <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-bodyLg transition-colors',
                active ? 'bg-surface-selected font-medium text-fg-link' : 'text-fg-secondary hover:bg-surface-subtle hover:text-fg-primary',
                focusRing
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto hidden w-64 md:block">
        <SymbolSearch size="sm" value={activeSymbol} placeholder="Search symbol" onSelect={(s) => setActiveSymbol(s.ticker)} />
      </div>

      <Button variant="brand" size="sm" className="ml-auto md:ml-0" iconLeading={<Sparkles className="size-3.5" />} onClick={() => setAiOpen(true)}>
        <span className="hidden sm:inline">Ask OptionsPlay</span>
        <span className="sm:hidden">Ask AI</span>
      </Button>
    </header>
  );
};
