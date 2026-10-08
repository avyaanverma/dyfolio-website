import { getPortfolioHoldings } from "../repositories/portfolio.repository.js";
import { getGoogleSymbol, getYahooSymbol } from "../providers/symbol-mapper.js";
import {
  getYahooPriceHistory,
  getYahooQuotes,
} from "../providers/yahoo.provider.js";
import { getGoogleFundamentals } from "../providers/google-finance-provider.js";

export async function getPortfolio() {
  // 1. Get holdings from PostgreSQL
  const holdings = await getPortfolioHoldings();

  // 2. Convert database exchange codes into Yahoo symbols
  const symbols = holdings.map((holding) =>
    getYahooSymbol(holding.stock.exchangeCode),
  );

  // 3. Fetch current market prices
  const quotes = await getYahooQuotes(symbols);

  const priceHistories = await Promise.all(
    symbols.map((symbol) => getYahooPriceHistory(symbol)),
  );

  const priceHistoryMap = new Map(
    symbols.map((symbol, index) => [symbol, priceHistories[index] ?? []]),
  );

  const fundamentals = await Promise.all(
    holdings.map((holding) => {
      const googleSymbol = getGoogleSymbol(holding.stock.exchangeCode);
      return getGoogleFundamentals(googleSymbol);
    }),
  );

  const fundamentalMap = new Map(
    fundamentals
      .filter(
        (fundamental): fundamental is NonNullable<typeof fundamental> =>
          fundamental !== null,
      )
      .map((fundamental) => [fundamental.symbol, fundamental]),
  );

  // 4. Create quick lookup:
  //
  // HDFCBANK.NS -> 2010
  // BAJFINANCE.NS -> 950
  //
  const quoteMap = new Map(
    quotes
      .filter((quote) => quote !== null) //
      .map((quote) => [quote.symbol, quote.cmp]),
  );

  // 5. Combine database data + market data
  const portfolioHoldings = holdings.map((holding) => {
    const purchasePrice = Number(holding.purchasePrice);
    const quantity = holding.quantity;

    const investment = purchasePrice * quantity;

    const yahooSymbol = getYahooSymbol(holding.stock.exchangeCode);

    const googleSymbol = getGoogleSymbol(holding.stock.exchangeCode);
    const fundamental = fundamentalMap.get(googleSymbol);

    const cmp = quoteMap.get(yahooSymbol) ?? null;

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
      priceHistory: priceHistoryMap.get(yahooSymbol) ?? [],
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
