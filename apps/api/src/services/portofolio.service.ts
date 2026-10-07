import { getPortfolioHoldings } from "../repositories/portfolio.repository.js";
import { getYahooSymbol } from "../providers/symbol-mapper.js";
import { getYahooQuotes } from "../providers/yahoo.provider.js";

export async function getPortfolio() {
  // 1. Get holdings from PostgreSQL
  const holdings = await getPortfolioHoldings();

  // 2. Convert database exchange codes into Yahoo symbols
  const symbols = holdings.map((holding) =>
    getYahooSymbol(holding.stock.exchangeCode),
  );

  // 3. Fetch current market prices
  const quotes = await getYahooQuotes(symbols);

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

  return {
    summary: {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
    },

    holdings: finalHoldings,
  };
}
