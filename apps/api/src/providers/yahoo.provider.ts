import YahooFinance from "yahoo-finance2";
import type { MarketQuote, PricePoint } from "./types.js";
import { getCachedQuote, setCachedQuote } from "../cache/market-data.cache.js";
import { logger } from "../lib/logger.js";

const yahooFinance = new YahooFinance();

export async function getYahooQuote(
  symbol: string,
): Promise<MarketQuote | null> {
  const cachedQuote = getCachedQuote(symbol);

  if (cachedQuote) {
    return cachedQuote;
  }

  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote || quote.regularMarketPrice == null) {
      logger.warn({ symbol }, "CMP unavailable");
      return null;
    }

    const marketQuote: MarketQuote = {
      symbol,
      cmp: quote.regularMarketPrice,
    };

    setCachedQuote(symbol, marketQuote);

    return marketQuote;
  } catch (error) {
    logger.warn({ err: error, symbol }, "Yahoo quote request failed");

    return null;
  }
}

export async function getYahooQuotes(
  symbols: string[],
): Promise<(MarketQuote | null)[]> {
  const results: (MarketQuote | null)[] = [];

  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5);

    const batchResults = await Promise.all(
      batch.map((symbol) => getYahooQuote(symbol)),
    );

    results.push(...batchResults);
  }

  return results;
}

export async function getYahooPriceHistory(
  symbol: string,
): Promise<(PricePoint | null)[]> {
  try {
    const period1 = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await yahooFinance.chart(symbol, {
      period1,
      interval: "5m",
    });

    return result.quotes
      .filter((quote) => quote.close !== null && quote.close !== undefined)
      .map((quote) => ({
        timestamp: new Date(quote.date).getTime(),
        price: quote.close,
      }));
  } catch (error) {
    logger.warn({ err: error, symbol }, "Yahoo price history request failed");

    return [];
  }
}
