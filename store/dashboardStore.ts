import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WidgetType =
  | 'technical-analysis'
  | 'credit-spreads'
  | 'top-strategies'
  | 'quote-board'
  | 'trade-ideas'
  | 'trading-calendar'
  | 'covered-calls';

export type ColSpan = 1 | 2 | 3 | 4;

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  colSpan: ColSpan;
  height: number;
  collapsed?: boolean;
  title?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: WidgetInstance[];
  /** Last explicitly saved layout: differs from `widgets` when there are unsaved changes. */
  saved: WidgetInstance[];
  /** Layout everyone else sees: differs from `saved` while a draft is in progress. */
  published: WidgetInstance[] | null;
  forkedFrom?: string;
  starter?: boolean;
  updatedAt: number;
}

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface TradeTicket {
  symbol: string;
  strategy: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  legs: string;
  price: number;
  maxProfit: number;
  maxRisk: number;
  probability: number;
  kind: 'credit' | 'debit';
}

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'warning';
  action?: { label: string; run: () => void };
}

export const GRID_UNIT = 8;
export const MIN_HEIGHT = 240;
export const MAX_HEIGHT = 960;
export const snapHeight = (h: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(h / GRID_UNIT) * GRID_UNIT));

let seq = 0;
const uid = (prefix = 'w') => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const w = (type: WidgetType, colSpan: ColSpan, height: number): WidgetInstance => ({ id: uid(), type, colSpan, height });

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  build: () => WidgetInstance[];
}

export const TEMPLATES: DashboardTemplate[] = [
  {
    id: 'options-trader',
    name: 'Options Trader',
    description: 'Technical analysis, credit spread screener, quotes and top strategies.',
    build: () => [
      w('technical-analysis', 1, 640),
      w('credit-spreads', 2, 640),
      w('quote-board', 1, 640),
      w('top-strategies', 3, 480),
      w('trade-ideas', 1, 480),
    ],
  },
  {
    id: 'income-investor',
    name: 'Income Investor',
    description: 'Covered call screener, DailyPlay calendar and a watchlist.',
    build: () => [w('covered-calls', 3, 480), w('quote-board', 1, 480), w('trading-calendar', 2, 480), w('trade-ideas', 2, 480)],
  },
  {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'A lightweight view: quotes, analysis and ideas for the active symbol.',
    build: () => [w('quote-board', 1, 560), w('technical-analysis', 1, 560), w('trade-ideas', 2, 560)],
  },
];

function makeDashboard(name: string, widgets: WidgetInstance[], extra: Partial<Dashboard> = {}): Dashboard {
  return { id: uid('d'), name, widgets, saved: widgets, published: null, updatedAt: Date.now(), ...extra };
}

const starterWidgets = TEMPLATES[0].build();
const STARTER = makeDashboard('Options Trader', starterWidgets, { published: starterWidgets, starter: true });

const HISTORY_LIMIT = 50;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export interface DashboardState {
  // Persisted
  dashboards: Dashboard[];
  activeDashboardId: string;
  activeSymbol: string;
  watchlist: string[];
  fitWidth: boolean;
  showGrid: boolean;
  dismissedStarterBanner: boolean;

  // Session
  isEditing: boolean;
  device: Device;
  selectedWidgetId: string | null;
  clipboard: WidgetInstance | null;
  past: WidgetInstance[][];
  future: WidgetInstance[][];
  libraryOpen: boolean;
  aiOpen: boolean;
  tradeTicket: TradeTicket | null;
  toasts: Toast[];

  // Symbol & watchlist
  setActiveSymbol: (ticker: string) => void;
  toggleWatch: (ticker: string) => void;

  // Dashboards
  setActiveDashboard: (id: string) => void;
  createDashboard: () => void;
  createFromTemplate: (templateId: string) => void;
  duplicateDashboard: (id?: string) => void;
  renameDashboard: (id: string, name: string) => void;
  deleteDashboard: (id: string) => void;
  save: () => void;
  publish: () => void;
  discardChanges: () => void;
  dismissStarterBanner: () => void;

  // Layout editing
  setEditing: (editing: boolean) => void;
  setDevice: (device: Device) => void;
  toggleFitWidth: () => void;
  toggleGrid: () => void;
  setLibraryOpen: (open: boolean) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (type: WidgetType, index?: number) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  moveWidget: (from: number, to: number) => void;
  /** Pushes the current layout onto the undo stack — call once before a drag or resize. */
  snapshot: () => void;
  patchWidget: (id: string, patch: Partial<WidgetInstance>, opts?: { record?: boolean }) => void;
  copyWidget: (id?: string) => void;
  pasteWidget: () => void;
  undo: () => void;
  redo: () => void;

  // Overlays
  setAiOpen: (open: boolean) => void;
  openTradeTicket: (ticket: TradeTicket) => void;
  closeTradeTicket: () => void;
  notify: (message: string, tone?: Toast['tone'], action?: Toast['action']) => void;
  dismissToast: (id: number) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => {
      const active = () => get().dashboards.find((d) => d.id === get().activeDashboardId) ?? get().dashboards[0];

      const commit = (widgets: WidgetInstance[], record = true) => {
        const current = active();
        if (!current) return;
        set((s) => ({
          past: record ? [...s.past, current.widgets].slice(-HISTORY_LIMIT) : s.past,
          future: record ? [] : s.future,
          dashboards: s.dashboards.map((d) => (d.id === current.id ? { ...d, widgets, updatedAt: Date.now() } : d)),
        }));
      };

      const switchTo = (dashboards: Dashboard[], id: string, editing: boolean) =>
        set({ dashboards, activeDashboardId: id, isEditing: editing, past: [], future: [], selectedWidgetId: null, libraryOpen: editing });

      let toastSeq = 0;

      return {
        dashboards: [STARTER],
        activeDashboardId: STARTER.id,
        activeSymbol: 'AAPL',
        watchlist: ['AAPL', 'SPY', 'NVDA', 'TSLA', 'MSFT', 'QQQ', 'AMZN', 'META'],
        fitWidth: false,
        showGrid: true,
        dismissedStarterBanner: false,

        isEditing: false,
        device: 'desktop',
        selectedWidgetId: null,
        clipboard: null,
        past: [],
        future: [],
        libraryOpen: false,
        aiOpen: false,
        tradeTicket: null,
        toasts: [],

        setActiveSymbol: (ticker) => set({ activeSymbol: ticker.toUpperCase() }),
        toggleWatch: (ticker) =>
          set((s) => ({
            watchlist: s.watchlist.includes(ticker) ? s.watchlist.filter((t) => t !== ticker) : [...s.watchlist, ticker],
          })),

        setActiveDashboard: (id) => switchTo(get().dashboards, id, false),

        createDashboard: () => {
          const d = makeDashboard(`Dashboard ${get().dashboards.length + 1}`, []);
          switchTo([...get().dashboards, d], d.id, true);
        },

        createFromTemplate: (templateId) => {
          const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
          const current = active();
          const widgets = t.build();
          // Filling an empty dashboard reuses its tab; otherwise the template opens in a new one.
          if (current && current.widgets.length === 0) {
            set((s) => ({
              dashboards: s.dashboards.map((d) => (d.id === current.id ? { ...d, widgets, name: d.name.startsWith('Dashboard') ? t.name : d.name } : d)),
              past: [...s.past, current.widgets],
              future: [],
              isEditing: true,
            }));
          } else {
            const d = makeDashboard(t.name, widgets, { saved: [] });
            switchTo([...get().dashboards, d], d.id, true);
          }
          get().notify(`“${t.name}” template applied — customize, then save.`, 'success');
        },

        duplicateDashboard: (id) => {
          const source = get().dashboards.find((d) => d.id === (id ?? get().activeDashboardId));
          if (!source) return;
          const widgets = source.widgets.map((x) => ({ ...x, id: uid() }));
          const copy = makeDashboard(`${source.name} (copy)`, widgets, { forkedFrom: source.name, saved: widgets });
          switchTo([...get().dashboards, copy], copy.id, true);
          get().notify(`Forked “${source.name}”. Changes stay private until you publish.`, 'info');
        },

        renameDashboard: (id, name) =>
          set((s) => ({ dashboards: s.dashboards.map((d) => (d.id === id ? { ...d, name: name.trim() || d.name } : d)) })),

        deleteDashboard: (id) => {
          const { dashboards, activeDashboardId } = get();
          const removed = dashboards.find((d) => d.id === id);
          if (!removed) return;
          const rest = dashboards.filter((d) => d.id !== id);
          const next = rest.length ? rest : [makeDashboard('Dashboard 1', [])];
          switchTo(next, activeDashboardId === id ? next[Math.max(0, dashboards.indexOf(removed) - 1)].id : activeDashboardId, rest.length === 0);
          get().notify(`Closed “${removed.name}”`, 'info', {
            label: 'Undo',
            run: () => set((s) => ({ dashboards: [...s.dashboards, removed], activeDashboardId: removed.id, past: [], future: [] })),
          });
        },

        save: () => {
          const d = active();
          set((s) => ({ dashboards: s.dashboards.map((x) => (x.id === d.id ? { ...x, saved: x.widgets } : x)) }));
          get().notify('Dashboard saved as draft', 'success');
        },

        publish: () => {
          const d = active();
          set((s) => ({
            dashboards: s.dashboards.map((x) => (x.id === d.id ? { ...x, saved: x.widgets, published: x.widgets, forkedFrom: undefined } : x)),
            isEditing: false,
            libraryOpen: false,
            selectedWidgetId: null,
          }));
          get().notify(`“${d.name}” is live`, 'success');
        },

        discardChanges: () => {
          const d = active();
          commit(d.saved);
          get().notify('Reverted to last saved version', 'info');
        },

        dismissStarterBanner: () => set({ dismissedStarterBanner: true }),

        setEditing: (isEditing) => set({ isEditing, libraryOpen: isEditing, selectedWidgetId: null }),
        setDevice: (device) => set({ device }),
        toggleFitWidth: () => set((s) => ({ fitWidth: !s.fitWidth })),
        toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
        setLibraryOpen: (libraryOpen) => set({ libraryOpen }),
        selectWidget: (selectedWidgetId) => set({ selectedWidgetId }),

        addWidget: (type, index) => {
          const widgets = [...active().widgets];
          const item: WidgetInstance = { id: uid(), type, colSpan: type === 'credit-spreads' || type === 'top-strategies' || type === 'covered-calls' ? 2 : 1, height: 480 };
          widgets.splice(index ?? widgets.length, 0, item);
          commit(widgets);
          set({ selectedWidgetId: item.id });
          requestAnimationFrame(() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
        },

        removeWidget: (id) => {
          commit(active().widgets.filter((x) => x.id !== id));
          set({ selectedWidgetId: null });
          get().notify('Widget removed', 'info', { label: 'Undo', run: () => get().undo() });
        },

        duplicateWidget: (id) => {
          const widgets = [...active().widgets];
          const i = widgets.findIndex((x) => x.id === id);
          if (i < 0) return;
          const copy = { ...widgets[i], id: uid() };
          widgets.splice(i + 1, 0, copy);
          commit(widgets);
          set({ selectedWidgetId: copy.id });
        },

        moveWidget: (from, to) => {
          const widgets = [...active().widgets];
          if (from === to || from < 0 || to < 0 || from >= widgets.length || to >= widgets.length) return;
          const [moved] = widgets.splice(from, 1);
          widgets.splice(to, 0, moved);
          commit(widgets);
        },

        snapshot: () => set((s) => ({ past: [...s.past, active().widgets].slice(-HISTORY_LIMIT), future: [] })),

        patchWidget: (id, patch, opts) => {
          const widgets = active().widgets.map((x) => (x.id === id ? { ...x, ...patch } : x));
          commit(widgets, opts?.record ?? true);
        },

        copyWidget: (id) => {
          const target = active().widgets.find((x) => x.id === (id ?? get().selectedWidgetId));
          if (!target) return;
          set({ clipboard: target });
          get().notify('Widget copied — press ⌘V to paste', 'info');
        },

        pasteWidget: () => {
          const { clipboard, selectedWidgetId } = get();
          if (!clipboard) return;
          const widgets = [...active().widgets];
          const at = selectedWidgetId ? widgets.findIndex((x) => x.id === selectedWidgetId) + 1 : widgets.length;
          const copy = { ...clipboard, id: uid() };
          widgets.splice(at, 0, copy);
          commit(widgets);
          set({ selectedWidgetId: copy.id });
        },

        undo: () => {
          const { past, future } = get();
          if (!past.length) return;
          const current = active();
          const previous = past[past.length - 1];
          set((s) => ({
            past: past.slice(0, -1),
            future: [current.widgets, ...future],
            dashboards: s.dashboards.map((d) => (d.id === current.id ? { ...d, widgets: previous } : d)),
          }));
        },

        redo: () => {
          const { past, future } = get();
          if (!future.length) return;
          const current = active();
          set((s) => ({
            past: [...past, current.widgets],
            future: future.slice(1),
            dashboards: s.dashboards.map((d) => (d.id === current.id ? { ...d, widgets: future[0] } : d)),
          }));
        },

        setAiOpen: (aiOpen) => set({ aiOpen }),
        openTradeTicket: (tradeTicket) => set({ tradeTicket }),
        closeTradeTicket: () => set({ tradeTicket: null }),

        notify: (message, tone = 'info', action) => {
          const id = ++toastSeq;
          set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone, action }] }));
          window.setTimeout(() => get().dismissToast(id), action ? 6000 : 3500);
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      };
    },
    {
      name: 'optionsplay-workspace',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        dashboards: s.dashboards,
        activeDashboardId: s.activeDashboardId,
        activeSymbol: s.activeSymbol,
        watchlist: s.watchlist,
        fitWidth: s.fitWidth,
        showGrid: s.showGrid,
        dismissedStarterBanner: s.dismissedStarterBanner,
      }),
    }
  )
);

export const useActiveDashboard = () =>
  useDashboardStore((s) => s.dashboards.find((d) => d.id === s.activeDashboardId) ?? s.dashboards[0]);

export function getDashboardStatus(d: Dashboard): { hasUnsaved: boolean; isDraft: boolean; isLive: boolean } {
  const hasUnsaved = !same(d.widgets, d.saved);
  const isDraft = !d.published || !same(d.saved, d.published);
  return { hasUnsaved, isDraft, isLive: !!d.published && !isDraft && !hasUnsaved };
}
