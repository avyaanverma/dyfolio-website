import { bseYahooSymbolMap } from "./bse-symbol-map.js";

export function getYahooSymbol(exchangeCode: string): string {
  // NSE symbol
  if (/^[A-Z]+$/.test(exchangeCode)) {
    return `${exchangeCode}.NS`;
  }

  // BSE code
  const yahooSymbol = bseYahooSymbolMap[exchangeCode];

  if (!yahooSymbol) {
    throw new Error(
      `No Yahoo symbol mapping found for BSE code: ${exchangeCode}`,
    );
  }

  return yahooSymbol;
}
