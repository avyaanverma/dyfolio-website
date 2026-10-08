import assert from "node:assert/strict";
import test from "node:test";
import {
  updateMarketData,
  type MarketDataWorkerDependencies,
} from "../workers/market-data.worker.js";

const holdings = [
  {
    id: 1,
    stockId: 11,
    stock: { exchangeCode: "AAA", name: "Alpha", sector: "Test" },
  },
  {
    id: 2,
    stockId: 22,
    stock: { exchangeCode: "BBB", name: "Beta", sector: "Test" },
  },
] as unknown as Awaited<
  ReturnType<MarketDataWorkerDependencies["getHoldings"]>
>;

function createDependencies(
  overrides: Partial<MarketDataWorkerDependencies> = {},
): MarketDataWorkerDependencies {
  return {
    getHoldings: async () => holdings,
    getYahooSymbol: (exchangeCode) => exchangeCode,
    getYahooQuotes: async (symbols) =>
      symbols.map((symbol) => ({ symbol, cmp: 100 })),
    getLatestPrice: async () => null,
    addPriceHistory: async () => undefined as never,
    trimPriceHistory: async () => undefined,
    logger: { info() {}, warn() {}, error() {} } as unknown as MarketDataWorkerDependencies["logger"],
    ...overrides,
  };
}

test("worker skips an unchanged CMP", async () => {
  let inserts = 0;
  const result = await updateMarketData(
    createDependencies({
      getLatestPrice: async () => 100,
      addPriceHistory: async () => {
        inserts += 1;
        return undefined as never;
      },
    }),
  );

  assert.equal(inserts, 0);
  assert.equal(result.skipped, 2);
});

test("worker stores a changed CMP and trims history", async () => {
  const inserted: Array<[number, number]> = [];
  const trimmed: number[] = [];

  const result = await updateMarketData(
    createDependencies({
      getLatestPrice: async () => 99,
      addPriceHistory: async (stockId, price) => {
        inserted.push([stockId, price]);
        return undefined as never;
      },
      trimPriceHistory: async (stockId) => {
        trimmed.push(stockId);
      },
    }),
  );

  assert.deepEqual(inserted, [[11, 100], [22, 100]]);
  assert.deepEqual(trimmed, [11, 22]);
  assert.equal(result.inserted, 2);
});

test("worker continues when Yahoo has no CMP for one stock", async () => {
  const inserted: number[] = [];

  const result = await updateMarketData(
    createDependencies({
      getYahooQuotes: async () => [null, { symbol: "BBB", cmp: 200 }],
      addPriceHistory: async (stockId) => {
        inserted.push(stockId);
        return undefined as never;
      },
    }),
  );

  assert.deepEqual(inserted, [22]);
  assert.equal(result.inserted, 1);
  assert.equal(result.skipped, 1);
});
