import React from 'react';
import { CalendarDays, Layers, LineChart, Lightbulb, Percent, Rows3, Star } from 'lucide-react';
import type { WidgetType } from '@/store/dashboardStore';
import type { WidgetProps } from './WidgetShell';
import { TechnicalAnalysisWidget } from './TechnicalAnalysisWidget';
import { CreditSpreadsWidget } from './CreditSpreadsWidget';
import { TopStrategiesWidget } from './TopStrategiesWidget';
import { QuoteBoardWidget } from './QuoteBoardWidget';
import { TradeIdeasWidget } from './TradeIdeasWidget';
import { TradingCalendarWidget } from './TradingCalendarWidget';
import { CoveredCallsWidget } from './CoveredCallsWidget';

export interface WidgetMeta {
  type: WidgetType;
  name: string;
  description: string;
  category: 'Analysis' | 'Screeners' | 'Watchlists' | 'Journal';
  icon: React.ReactNode;
  component: React.FC<WidgetProps>;
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  {
    type: 'technical-analysis',
    name: 'Technical Analysis',
    description: 'Trend, rankings, key metrics and support/resistance for the active symbol.',
    category: 'Analysis',
    icon: <LineChart className="size-4" />,
    component: TechnicalAnalysisWidget,
  },
  {
    type: 'credit-spreads',
    name: 'Credit Spreads',
    description: 'Screener ranking spreads by premium relative to width.',
    category: 'Screeners',
    icon: <Rows3 className="size-4" />,
    component: CreditSpreadsWidget,
  },
  {
    type: 'top-strategies',
    name: 'Top Strategies',
    description: 'Ranked strategies with legs, probability and payoff.',
    category: 'Analysis',
    icon: <Layers className="size-4" />,
    component: TopStrategiesWidget,
  },
  {
    type: 'quote-board',
    name: 'Quote Board',
    description: 'Live watchlist that drives the rest of the dashboard.',
    category: 'Watchlists',
    icon: <Star className="size-4" />,
    component: QuoteBoardWidget,
  },
  {
    type: 'trade-ideas',
    name: 'Trade Ideas',
    description: 'Daily scanner setups with the rationale for each.',
    category: 'Analysis',
    icon: <Lightbulb className="size-4" />,
    component: TradeIdeasWidget,
  },
  {
    type: 'covered-calls',
    name: 'Income Screener',
    description: 'Covered calls and cash-secured puts by annualized return.',
    category: 'Screeners',
    icon: <Percent className="size-4" />,
    component: CoveredCallsWidget,
  },
  {
    type: 'trading-calendar',
    name: 'DailyPlay Journal',
    description: 'Calendar of alert outcomes and win rate.',
    category: 'Journal',
    icon: <CalendarDays className="size-4" />,
    component: TradingCalendarWidget,
  },
];

export const getWidgetMeta = (type: WidgetType) => WIDGET_REGISTRY.find((w) => w.type === type) ?? WIDGET_REGISTRY[0];
