import { logger } from "../lib/logger.js";
import {
  addPriceHistory,
  getLatestPrice,
  trimPriceHistory,
} from "../repositories/price-history.repository.js";
import { getPortfolioHoldings } from "../repositories/portfolio.repository.js";
import { getYahooQuotes } from "../providers/yahoo.provider.js";
import { getYahooSymbol } from "../providers/symbol-mapper.js";

type WorkerLogger = Pick<typeof logger, "info" | "warn" | "error">;

export type MarketDataWorkerDependencies = {
  getHoldings: typeof getPortfolioHoldings;
  getYahooSymbol: typeof getYahooSymbol;
  getYahooQuotes: typeof getYahooQuotes;
  getLatestPrice: typeof getLatestPrice;
  addPriceHistory: typeof addPriceHistory;
  trimPriceHistory: typeof trimPriceHistory;
  logger: WorkerLogger;
};

const defaultDependencies: MarketDataWorkerDependencies = {
  getHoldings: getPortfolioHoldings,
  getYahooSymbol,
  getYahooQuotes,
  getLatestPrice,
  addPriceHistory,
  trimPriceHistory,
  logger,
};

/** Fetches CMPs and persists only changed prices. Safe to invoke from a cron job. */
export async function updateMarketData(
  dependencies: MarketDataWorkerDependencies = defaultDependencies,
) {
  const { logger: workerLogger } = dependencies;
  let inserted = 0;
  let skipped = 0;

  let holdings: Awaited<ReturnType<typeof dependencies.getHoldings>>;
  try {
    holdings = await dependencies.getHoldings();
  } catch (error) {
    workerLogger.error({ err: error }, "Market worker could not read holdings");
    return { inserted, skipped };
  }

  const targets = holdings.flatMap((holding) => {
    try {
      return [
        {
          stockId: holding.stockId,
          symbol: dependencies.getYahooSymbol(holding.stock.exchangeCode),
        },
      ];
    } catch (error) {
      workerLogger.warn(
        {
          err: error,
          stockId: holding.stockId,
          exchangeCode: holding.stock.exchangeCode,
        },
        "Market worker skipped unmapped stock",
      );
      return [];
    }
  });

  let quotes: Awaited<ReturnType<typeof dependencies.getYahooQuotes>>;
  try {
    quotes = await dependencies.getYahooQuotes(
      targets.map((target) => target.symbol),
    );
  } catch (error) {
    workerLogger.error({ err: error }, "Market worker could not fetch Yahoo quotes");
    return { inserted, skipped };
  }

  const quoteMap = new Map(
    quotes
      .filter((quote): quote is NonNullable<typeof quote> => quote !== null)
      .map((quote) => [quote.symbol, quote.cmp]),
  );

  for (const target of targets) {
    const cmp = quoteMap.get(target.symbol);

    if (cmp === undefined) {
      skipped += 1;
      workerLogger.warn({ ...target }, "Market worker received no CMP");
      continue;
    }

    try {
      const latestPrice = await dependencies.getLatestPrice(target.stockId);

      if (latestPrice === cmp) {
        skipped += 1;
        continue;
      }

      await dependencies.addPriceHistory(target.stockId, cmp);
      await dependencies.trimPriceHistory(target.stockId);
      inserted += 1;
    } catch (error) {
      skipped += 1;
      workerLogger.error({ err: error, ...target }, "Market worker could not persist CMP");
    }
  }

  workerLogger.info({ inserted, skipped }, "Market data update completed");
  return { inserted, skipped };
}
