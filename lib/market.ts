// Mock market data. Values are derived from the symbol via a seeded PRNG so they are
// stable across renders; store/marketStore.ts layers simulated price ticks on top.
import { seededRandom } from './utils';

export type Bias = 'Bullish' | 'Bearish' | 'Neutral';

export interface SymbolInfo {
  ticker: string;
  name: string;
  type: 'Stock' | 'ETF' | 'Index';
  sector: string;
  basePrice: number;
}

export const UNIVERSE: SymbolInfo[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', type: 'Stock', sector: 'Technology', basePrice: 251.08 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', sector: 'Technology', basePrice: 428.15 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock', sector: 'Semiconductors', basePrice: 186.72 },
  { ticker: 'TSLA', name: 'Tesla Inc.', type: 'Stock', sector: 'Consumer Durables', basePrice: 228.09 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', sector: 'Retail', basePrice: 184.36 },
  { ticker: 'META', name: 'Meta Platforms Inc.', type: 'Stock', sector: 'Communication', basePrice: 502.8 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', sector: 'Communication', basePrice: 165.4 },
  { ticker: 'NFLX', name: 'Netflix Inc.', type: 'Stock', sector: 'Communication', basePrice: 641.16 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', type: 'Stock', sector: 'Semiconductors', basePrice: 156.2 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', sector: 'Index Fund', basePrice: 510.21 },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', sector: 'Index Fund', basePrice: 438.9 },
  { ticker: 'IWM', name: 'iShares Russell 2000', type: 'ETF', sector: 'Index Fund', basePrice: 207.3 },
  { ticker: 'XLP', name: 'Consumer Staples SPDR', type: 'ETF', sector: 'Consumer Staples', basePrice: 77.44 },
  { ticker: 'V', name: 'Visa Inc.', type: 'Stock', sector: 'Finance', basePrice: 338.5 },
  { ticker: 'MA', name: 'Mastercard Inc.', type: 'Stock', sector: 'Finance', basePrice: 559.03 },
  { ticker: 'LLY', name: 'Eli Lilly & Co.', type: 'Stock', sector: 'Health Technology', basePrice: 1022.58 },
  { ticker: 'AZO', name: 'AutoZone Inc.', type: 'Stock', sector: 'Retail', basePrice: 3620.4 },
  { ticker: 'CRCL', name: 'Circle Internet Group', type: 'Stock', sector: 'Finance', basePrice: 112.61 },
  { ticker: 'PLTR', name: 'Palantir Technologies', type: 'Stock', sector: 'Technology', basePrice: 78.14 },
  { ticker: 'COIN', name: 'Coinbase Global', type: 'Stock', sector: 'Finance', basePrice: 251.6 },
  { ticker: 'UBER', name: 'Uber Technologies', type: 'Stock', sector: 'Transportation', basePrice: 71.22 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Stock', sector: 'Finance', basePrice: 242.9 },
  { ticker: 'DIS', name: 'Walt Disney Co.', type: 'Stock', sector: 'Communication', basePrice: 112.05 },
  { ticker: 'WULF', name: 'TeraWulf Inc.', type: 'Stock', sector: 'Technology', basePrice: 16.42 },
];

export const findSymbol = (ticker: string) => UNIVERSE.find((s) => s.ticker === ticker.toUpperCase());

export interface Quote {
  ticker: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  bid: number;
  ask: number;
  volume: number;
  history: number[];
  /** Direction of the last tick; drives the price-flash animation. */
  lastMove: 1 | -1 | 0;
}

export function initialQuote(info: SymbolInfo): Quote {
  const rnd = seededRandom(info.ticker + ':quote');
  const prevClose = +(info.basePrice * (1 + (rnd() - 0.5) * 0.03)).toFixed(2);
  const history: number[] = [];
  let p = prevClose;
  for (let i = 0; i < 30; i++) {
    p = p * (1 + (rnd() - 0.5) * 0.012);
    history.push(+p.toFixed(2));
  }
  history.push(info.basePrice);
  return buildQuote(info.ticker, info.basePrice, prevClose, history, 0, Math.round(5e6 + rnd() * 6e7));
}

export function buildQuote(ticker: string, price: number, prevClose: number, history: number[], lastMove: Quote['lastMove'], volume: number): Quote {
  const spread = Math.max(0.01, price * 0.0004);
  const change = price - prevClose;
  return {
    ticker,
    price,
    prevClose,
    change,
    changePct: (change / prevClose) * 100,
    bid: +(price - spread).toFixed(2),
    ask: +(price + spread).toFixed(2),
    volume,
    history,
    lastMove,
  };
}

export interface Technicals {
  bias: Bias;
  summary: string;
  trend1m: { bias: Bias; strength: number };
  trend6m: { bias: Bias; strength: number };
  liquidity: { label: 'Very Liquid' | 'Liquid' | 'Somewhat Liquid' | 'Not Liquid'; bars: 1 | 2 | 3 };
  ivRank: number;
  technicalScore: number;
  marketCap: number;
  pe: number;
  eps: number;
  divYield: number;
  week52: { low: number; high: number };
  support: { price: number; date: string }[];
  resistance: { price: number; date: string }[];
  nextEarnings: string;
}

const LIQUIDITY = [
  { label: 'Not Liquid', bars: 1 },
  { label: 'Somewhat Liquid', bars: 2 },
  { label: 'Liquid', bars: 2 },
  { label: 'Very Liquid', bars: 3 },
] as const;

const shortDate = (rnd: () => number) =>
  `${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}/${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`;

export function getTechnicals(ticker: string, price: number): Technicals {
  const info = findSymbol(ticker);
  const rnd = seededRandom(ticker + ':ta');
  const score = Math.round(rnd() * 10);
  const bias: Bias = score >= 6 ? 'Bullish' : score <= 3 ? 'Bearish' : 'Neutral';
  const t = (b: Bias) => ({ bias: rnd() > 0.25 ? b : ('Neutral' as Bias), strength: 2 + Math.floor(rnd() * 4) });
  const s1 = +(price * (0.955 + rnd() * 0.02)).toFixed(2);
  const s2 = +(price * (0.88 + rnd() * 0.04)).toFixed(2);
  const r1 = +(price * (1.02 + rnd() * 0.04)).toFixed(2);
  const r2 = +(price * (1.08 + rnd() * 0.05)).toFixed(2);
  const eps = +((rnd() * 12 - 1).toFixed(2));
  const name = info?.name ?? ticker;
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(rnd() * 12)];

  return {
    bias,
    summary:
      bias === 'Neutral'
        ? `${name} is trading sideways between support at ${s1.toFixed(2)} and resistance at ${r1.toFixed(2)}.`
        : `${name} is in a ${bias.toLowerCase()} trend with ${bias === 'Bullish' ? 'support' : 'resistance'} at $${(bias === 'Bullish' ? s1 : r1).toFixed(2)}.`,
    trend1m: t(bias),
    trend6m: t(bias),
    liquidity: LIQUIDITY[Math.floor(rnd() * LIQUIDITY.length)],
    ivRank: Math.round(5 + rnd() * 80),
    technicalScore: score,
    marketCap: price * (2e8 + rnd() * 1.6e10),
    pe: +(eps > 0 ? price / eps : -(rnd() * 20)).toFixed(2),
    eps,
    divYield: info?.type === 'ETF' || rnd() > 0.5 ? +(rnd() * 2.5).toFixed(2) : 0,
    week52: { low: +(price * (0.62 + rnd() * 0.2)).toFixed(2), high: +(price * (1.04 + rnd() * 0.2)).toFixed(2) },
    support: [
      { price: s1, date: shortDate(rnd) },
      { price: s2, date: shortDate(rnd) },
    ],
    resistance: [
      { price: r1, date: shortDate(rnd) },
      { price: r2, date: shortDate(rnd) },
    ],
    nextEarnings: `${month} ${1 + Math.floor(rnd() * 27)}, 2026 ${rnd() > 0.5 ? 'After Market' : 'Before Market'}`,
  };
}

export interface CreditSpread {
  id: string;
  symbol: string;
  bias: 'Bullish' | 'Bearish';
  type: 'Call' | 'Put';
  price: number;
  sellStrike: number;
  buyStrike: number;
  expiry: string;
  dte: number;
  premium: number;
  width: number;
  premWidth: number;
  winRate: number;
  ivRank: number;
  earnings: string;
}

const EXPIRIES = [
  { label: '04/24/26', dte: 7 },
  { label: '05/01/26', dte: 14 },
  { label: '05/15/26', dte: 28 },
  { label: '06/18/26', dte: 62 },
];

export function getCreditSpreads(): CreditSpread[] {
  const rnd = seededRandom('credit-spreads-v2');
  const rows: CreditSpread[] = [];
  for (const info of UNIVERSE) {
    const n = 1 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const bias = rnd() > 0.45 ? 'Bullish' : 'Bearish';
      const type = bias === 'Bullish' ? 'Put' : 'Call';
      const inc = info.basePrice > 500 ? 10 : info.basePrice > 100 ? 5 : info.basePrice > 30 ? 1 : 0.5;
      const width = inc * (1 + Math.floor(rnd() * 3));
      const dist = info.basePrice * (0.01 + rnd() * 0.05);
      const sell = Math.round((bias === 'Bullish' ? info.basePrice - dist : info.basePrice + dist) / inc) * inc;
      const buy = bias === 'Bullish' ? sell - width : sell + width;
      const premWidth = +(18 + rnd() * 32).toFixed(1);
      const exp = EXPIRIES[Math.floor(rnd() * EXPIRIES.length)];
      rows.push({
        id: `${info.ticker}-${k}`,
        symbol: info.ticker,
        bias,
        type,
        price: info.basePrice,
        sellStrike: sell,
        buyStrike: buy,
        expiry: exp.label,
        dte: exp.dte,
        premium: +((width * premWidth) / 100).toFixed(2),
        width,
        premWidth,
        winRate: Math.round(52 + rnd() * 34),
        ivRank: Math.round(5 + rnd() * 70),
        earnings: rnd() > 0.7 ? `${exp.label.slice(0, 5)} AM` : '—',
      });
    }
  }
  return rows;
}

export type StrategyName = 'Long Call Vertical' | 'Bull Put Spread' | 'Bear Call Spread' | 'Iron Condor' | 'Covered Call';

export interface StrategyIdea {
  id: string;
  symbol: string;
  strategy: StrategyName;
  bias: Bias;
  title: string;
  legs: { side: 'Buy' | 'Sell'; qty: number; strike: number; type: 'Call' | 'Put'; expiry: string }[];
  rating: number;
  dte: number;
  score: number;
  probability: number;
  cost: number;
  risk: number;
  reward: number;
}

export const STRATEGIES: StrategyName[] = ['Long Call Vertical', 'Bull Put Spread', 'Bear Call Spread', 'Iron Condor', 'Covered Call'];

export function getStrategies(): StrategyIdea[] {
  const rnd = seededRandom('strategies-v2');
  return UNIVERSE.slice(0, 20).flatMap((info, i) => {
    const strategy = STRATEGIES[i % STRATEGIES.length];
    const bias: Bias = strategy === 'Bear Call Spread' ? 'Bearish' : strategy === 'Iron Condor' ? 'Neutral' : 'Bullish';
    const inc = info.basePrice > 500 ? 10 : info.basePrice > 100 ? 5 : 1;
    const atm = Math.round(info.basePrice / inc) * inc;
    const width = inc * (1 + Math.floor(rnd() * 3));
    const expiry = 'Apr 10';
    const type: 'Call' | 'Put' = strategy === 'Bull Put Spread' ? 'Put' : 'Call';
    const legs =
      strategy === 'Iron Condor'
        ? [
            { side: 'Buy' as const, qty: 1, strike: atm - 2 * width, type: 'Put' as const, expiry },
            { side: 'Sell' as const, qty: 1, strike: atm - width, type: 'Put' as const, expiry },
            { side: 'Sell' as const, qty: 1, strike: atm + width, type: 'Call' as const, expiry },
            { side: 'Buy' as const, qty: 1, strike: atm + 2 * width, type: 'Call' as const, expiry },
          ]
        : [
            { side: strategy === 'Long Call Vertical' ? ('Buy' as const) : ('Sell' as const), qty: 1, strike: atm, type, expiry },
            { side: strategy === 'Long Call Vertical' ? ('Sell' as const) : ('Buy' as const), qty: 1, strike: strategy === 'Bull Put Spread' ? atm - width : atm + width, type, expiry },
          ];
    const cost = Math.round(width * 100 * (0.25 + rnd() * 0.3));
    const debit = strategy === 'Long Call Vertical' || strategy === 'Covered Call';
    const risk = debit ? cost : width * 100 - cost;
    const reward = debit ? width * 100 - cost : cost;
    const strikes = legs.map((l) => l.strike).join('/');
    return [
      {
        id: `${info.ticker}-${strategy}`,
        symbol: info.ticker,
        strategy,
        bias,
        title: `${legs[0].side} ${legs[0].qty} ${info.ticker} ${expiry} ${strikes} ${strategy === 'Iron Condor' ? 'Iron Condor' : `${type} Vertical`}`,
        legs,
        rating: 3 + Math.floor(rnd() * 3),
        dte: 7 + Math.floor(rnd() * 50),
        score: Math.round(30 + rnd() * 68),
        probability: +(35 + rnd() * 40).toFixed(1),
        cost,
        risk,
        reward,
      },
    ];
  });
}

export interface TradeIdea {
  id: string;
  symbol: string;
  bias: 'Bullish' | 'Bearish';
  setup: string;
  rationale: string;
  technicalScore: number;
}

export const TRADE_IDEAS: TradeIdea[] = [
  { id: 'nvda', symbol: 'NVDA', bias: 'Bullish', setup: 'Breakout continuation', rationale: 'Broke through resistance on expanding volume with sustained institutional accumulation.', technicalScore: 9.5 },
  { id: 'aapl', symbol: 'AAPL', bias: 'Bearish', setup: 'Bearish trend following', rationale: 'A short-term rally inside a longer-term downtrend offers favorable risk/reward for a bearish trade.', technicalScore: 8.0 },
  { id: 'meta', symbol: 'META', bias: 'Bullish', setup: 'CCI dip in bullish trend', rationale: 'Pulled back to the 20-day average inside an intact uptrend — a potential buying opportunity.', technicalScore: 8.5 },
  { id: 'tsla', symbol: 'TSLA', bias: 'Bearish', setup: 'Failed breakout', rationale: 'Rejected at prior highs with momentum divergence; watch for a close below support.', technicalScore: 7.0 },
  { id: 'amzn', symbol: 'AMZN', bias: 'Bullish', setup: 'Higher-low reversal', rationale: 'Formed a higher low at trend support with improving relative strength versus the S&P 500.', technicalScore: 7.5 },
];
