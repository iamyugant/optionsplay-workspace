import { create } from 'zustand';
import { UNIVERSE, buildQuote, initialQuote, type Quote } from '@/lib/market';

interface MarketState {
  quotes: Record<string, Quote>;
  streaming: boolean;
  lastUpdated: number | null;
  tick: () => void;
  start: () => () => void;
}

const INITIAL = Object.fromEntries(UNIVERSE.map((s) => [s.ticker, initialQuote(s)]));

// One interval drives the whole app: each tick nudges a few symbols along a random walk.
export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: INITIAL,
  streaming: false,
  lastUpdated: null,

  tick: () => {
    const quotes = { ...get().quotes };
    const tickers = Object.keys(quotes);
    for (let i = 0; i < 6; i++) {
      const t = tickers[Math.floor(Math.random() * tickers.length)];
      const q = quotes[t];
      const drift = (Math.random() - 0.5) * 0.003;
      const price = Math.max(0.5, +(q.price * (1 + drift)).toFixed(2));
      if (price === q.price) continue;
      const history = [...q.history.slice(-59), price];
      quotes[t] = buildQuote(t, price, q.prevClose, history, price > q.price ? 1 : -1, q.volume + Math.round(Math.random() * 4000));
    }
    set({ quotes, lastUpdated: Date.now() });
  },

  start: () => {
    if (get().streaming) return () => {};
    set({ streaming: true });
    const id = window.setInterval(() => get().tick(), 1500);
    return () => {
      window.clearInterval(id);
      set({ streaming: false });
    };
  },
}));

export const useQuote = (ticker: string): Quote | undefined => useMarketStore((s) => s.quotes[ticker.toUpperCase()]);
