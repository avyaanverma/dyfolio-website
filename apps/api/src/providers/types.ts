export type MarketQuote = {
  symbol: string;
  cmp: number;
};

export type FundamentalData = {
  symbol: string;
  peRatio: number | null;
  latestEarnings: number | null;
};

export type PricePoint = {
  timestamp: number;
  price: number | null;
};