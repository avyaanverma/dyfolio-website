import { getYahooSymbol } from "../providers/symbol-mapper.js";
import { getYahooQuote } from "../providers/yahoo.provider.js";

async function main() {
  const exchangeCode = "HDFCBANK";
  const quote = await getYahooQuote(getYahooSymbol(exchangeCode));

  console.log(quote);
}

main().catch(console.error);
