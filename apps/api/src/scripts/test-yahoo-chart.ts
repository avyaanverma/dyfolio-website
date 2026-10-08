import { getYahooPriceHistory } from "../providers/yahoo.provider.js";

async function test() {
  const history = await getYahooPriceHistory("HDFCBANK.NS");

  console.log("Points:", history.length);
  console.log("First:", history[0]);
  console.log("Last:", history.at(-1));
}

test();
