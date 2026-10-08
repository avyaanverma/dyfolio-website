import { getPortfolioHoldings } from "../repositories/portfolio.repository.js";
import { getGoogleSymbol } from "../providers/symbol-mapper.js";
import { getGoogleFundamentals } from "../providers/google-finance-provider.js";
import {
  getLatestPrice,
  getPriceHistory,
} from "../repositories/price-history.repository.js";

export async function getPortfolio() {
  // 1. Get holdings from PostgreSQL
  const holdings = await getPortfolioHoldings();

  // Fundamentals retain their existing long-lived cache. CMP and chart data are
  // read from PostgreSQL only; the market worker is the only Yahoo caller.
  const [fundamentals, marketData] = await Promise.all([
    Promise.all(
      holdings.map((holding) => {
        const googleSymbol = getGoogleSymbol(holding.stock.exchangeCode);
        return getGoogleFundamentals(googleSymbol);
      }),
    ),
    Promise.all(
      holdings.map(async (holding) => ({
        latestPrice: await getLatestPrice(holding.stockId),
        priceHistory: await getPriceHistory(holding.stockId),
      })),
    ),
  ]);

  const fundamentalMap = new Map(
    fundamentals
      .filter(
        (fundamental): fundamental is NonNullable<typeof fundamental> =>
          fundamental !== null,
      )
      .map((fundamental) => [fundamental.symbol, fundamental]),
  );

  // Combine stable portfolio data with persisted market data.
  const portfolioHoldings = holdings.map((holding, index) => {
    const purchasePrice = Number(holding.purchasePrice);
    const quantity = holding.quantity;

    const investment = purchasePrice * quantity;

    const googleSymbol = getGoogleSymbol(holding.stock.exchangeCode);
    const fundamental = fundamentalMap.get(googleSymbol);
    const persistedMarketData = marketData[index]!;
    const cmp = persistedMarketData.latestPrice;

    const presentValue = cmp === null ? null : cmp * quantity;

    const gainLoss = presentValue === null ? null : presentValue - investment;

    return {
      id: holding.id,

      stock: {
        name: holding.stock.name,
        exchangeCode: holding.stock.exchangeCode,
        sector: holding.stock.sector,
      },

      purchasePrice,
      quantity,
      investment,

      cmp,
      presentValue,
      gainLoss,
      priceHistory: persistedMarketData.priceHistory,
      peRatio: fundamental?.peRatio ?? null,
      latestEarnings: fundamental?.latestEarnings ?? null,
    };
  });

  // 6. Calculate total investment
  const totalInvestment = portfolioHoldings.reduce(
    (total, holding) => total + holding.investment,
    0,
  );

  // 7. Calculate portfolio percentage
  const finalHoldings = portfolioHoldings.map((holding) => ({
    ...holding,

    portfolioPercentage:
      totalInvestment === 0 ? 0 : (holding.investment / totalInvestment) * 100,
  }));

  // 8. Calculate portfolio-level present value
  const totalPresentValue = finalHoldings.reduce(
    (total, holding) => total + (holding.presentValue ?? 0),
    0,
  );

  // 9. Calculate portfolio-level gain/loss
  const totalGainLoss = totalPresentValue - totalInvestment;

  const sectorMap = new Map<
    string,
    {
      totalInvestment: number;
      totalPresentValue: number;
      totalGainLoss: number;
    }
  >();

  for (const holding of finalHoldings) {
    const sector = holding.stock.sector;

    const existing = sectorMap.get(sector);

    if (existing) {
      existing.totalInvestment += holding.investment;
      existing.totalPresentValue += holding.presentValue ?? 0;
      existing.totalGainLoss += holding.gainLoss ?? 0;
    } else {
      sectorMap.set(sector, {
        totalInvestment: holding.investment,
        totalPresentValue: holding.presentValue ?? 0,
        totalGainLoss: holding.gainLoss ?? 0,
      });
    }
  }

  const sectors = Array.from(sectorMap.entries()).map(([name, values]) => ({
    name,
    ...values,
  }));

  return {
    summary: {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
    },
    sectors,
    holdings: finalHoldings,
  };
}
