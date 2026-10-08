import type { MarketQuote, PricePoint } from "../providers/types.js";

type CachedMarketData = {
  quote: MarketQuote;
  expiresAt: number;
};

const cache = new Map<string, CachedMarketData>();
const priceHistoryCache = new Map<string, { points: PricePoint[]; expiresAt: number }>();

const CACHE_TTL = 15_000;
const PRICE_HISTORY_CACHE_TTL = 5 * 60_000;

export function getCachedQuote(symbol: string): MarketQuote | null {
  const cached = cache.get(symbol);

  if (!cached) {
    return null;
  }

  if (Date.now() >= cached.expiresAt) {
    cache.delete(symbol);
    return null;
  }

  return cached.quote;
}

export function setCachedQuote(symbol: string, quote: MarketQuote) {
  cache.set(symbol, {
    quote,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

export function getCachedPriceHistory(symbol: string): PricePoint[] | null {
  const cached = priceHistoryCache.get(symbol);

  if (!cached || Date.now() >= cached.expiresAt) {
    priceHistoryCache.delete(symbol);
    return null;
  }

  return cached.points;
}

export function setCachedPriceHistory(symbol: string, points: PricePoint[]) {
  priceHistoryCache.set(symbol, {
    points,
    expiresAt: Date.now() + PRICE_HISTORY_CACHE_TTL,
  });
}
