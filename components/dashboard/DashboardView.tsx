'use client';

import React, { useEffect, useState } from 'react';
import { Info, LayoutDashboard, Lightbulb, Star, X } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { DashboardTabs } from './DashboardTabs';
import { DashboardToolbar } from './DashboardToolbar';
import { DashboardCanvas } from './DashboardCanvas';
import { WidgetLibrary } from './WidgetLibrary';
import { TradeTicketModal } from './TradeTicketModal';
import { AskOptionsPlayDrawer } from './AskOptionsPlayDrawer';
import { Toaster } from '@/components/ui/Toaster';
import { BottomNav } from '@/components/ui/BottomNav';
import { Button, IconButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActiveDashboard, useDashboardStore } from '@/store/dashboardStore';
import { useMarketStore } from '@/store/marketStore';

const LoadingShell = () => (
  <div className="flex flex-col gap-4 p-4">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  </div>
);

// The store skips automatic hydration so the first client render matches the server;
// we rehydrate here and hold a skeleton until it lands.
export const DashboardView: React.FC = () => {
  const [ready, setReady] = useState(false);
  const isEditing = useDashboardStore((s) => s.isEditing);
  const libraryOpen = useDashboardStore((s) => s.libraryOpen);
  const dismissedBanner = useDashboardStore((s) => s.dismissedStarterBanner);
  const dismissBanner = useDashboardStore((s) => s.dismissStarterBanner);
  const setEditing = useDashboardStore((s) => s.setEditing);
  const setAiOpen = useDashboardStore((s) => s.setAiOpen);
  const dashboard = useActiveDashboard();

  useEffect(() => {
    void useDashboardStore.persist.rehydrate();
    setReady(true);
  }, []);

  useEffect(() => useMarketStore.getState().start(), []);

  if (!ready) return <LoadingShell />;

  const showStarterBanner = dashboard?.starter && !dismissedBanner;

  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      <AppHeader />

      {showStarterBanner && (
        <div className="flex items-center gap-2 bg-brand-blue-50 px-4 py-2 text-bodyMd text-brand-blue-900 sm:justify-center">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 sm:flex-none">This is a starter dashboard template — you can build your own.</span>
          <Button variant="tertiary" size="sm" className="hidden sm:inline-flex" onClick={() => useDashboardStore.getState().createDashboard()}>
            Create a dashboard
          </Button>
          <IconButton label="Dismiss" size="xs" onClick={dismissBanner}>
            <X className="size-3.5" aria-hidden="true" />
          </IconButton>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-line-subtle bg-surface-default px-4 py-1.5">
        <DashboardTabs />
      </div>
      <DashboardToolbar />

      <main className="flex min-h-0 flex-1 gap-4 p-4 pb-20 sm:pb-4">
        {isEditing && libraryOpen && <div className="hidden lg:block"><WidgetLibrary /></div>}
        <div className="min-w-0 flex-1">
          <DashboardCanvas />
        </div>
      </main>

      <BottomNav
        className="fixed inset-x-0 bottom-0 z-30 sm:hidden"
        activeId={isEditing ? 'edit' : 'home'}
        items={[
          { id: 'home', label: 'Home', icon: <LayoutDashboard className="size-5" />, onSelect: () => setEditing(false) },
          { id: 'edit', label: 'Build', icon: <Star className="size-5" />, onSelect: () => setEditing(true) },
          { id: 'ai', label: 'Ask AI', icon: <Lightbulb className="size-5" />, badge: true, onSelect: () => setAiOpen(true) },
        ]}
      />

      <AskOptionsPlayDrawer />
      <TradeTicketModal />
      <Toaster />
    </div>
  );
};
