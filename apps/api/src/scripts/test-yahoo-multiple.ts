import { getYahooQuote } from "../providers/yahoo.provider.js";
import { getYahooSymbol } from "../providers/symbol-mapper.js";

async function main() {
  const exchangeCodes = [
    "HDFCBANK",
    "BAJFINANCE",

    "532174",
    "544252",
    "542651",
    "544028",
    "544107",
    "532790",
  ];

  for (const exchangeCode of exchangeCodes) {
    try {
      const symbol = getYahooSymbol(exchangeCode);

      console.log(`${exchangeCode} → ${symbol}`);

      const quote = await getYahooQuote(symbol);

      console.log(quote);
    } catch (error) {
      console.error(`Failed for ${exchangeCode}:`, error);
    }
  }
}

main().catch(console.error);
