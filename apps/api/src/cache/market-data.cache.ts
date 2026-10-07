import type { MarketQuote } from "../providers/types.js";

type CachedMarketData = {
  quote: MarketQuote;
  expiresAt: number;
};

const cache = new Map<string, CachedMarketData>();

const CACHE_TTL = 15_000;

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
