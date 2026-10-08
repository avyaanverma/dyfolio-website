import assert from "node:assert/strict";
import test from "node:test";
import {
  addPriceHistory,
  getLatestPrice,
  trimPriceHistory,
  type PriceHistoryRepositoryClient,
} from "../repositories/price-history.repository.js";

test("adds a price-history point for a stock", async () => {
  let receivedData: unknown;
  const client = {
    priceHistory: {
      create: async ({ data }: { data: unknown }) => {
        receivedData = data;
      },
    },
  } as unknown as PriceHistoryRepositoryClient;

  await addPriceHistory(7, 123.45, client);

  assert.deepEqual(receivedData, { stockId: 7, price: 123.45 });
});

test("reads the latest persisted price", async () => {
  const client = {
    priceHistory: {
      findFirst: async () => ({ price: 456.78 }),
    },
  } as unknown as PriceHistoryRepositoryClient;

  assert.equal(await getLatestPrice(7, client), 456.78);
});

test("trims history beyond the latest 30 points", async () => {
  let deletedIds: number[] = [];
  const client = {
    priceHistory: {
      findMany: async () => [{ id: 1 }, { id: 2 }],
      deleteMany: async ({ where }: { where: { id: { in: number[] } } }) => {
        deletedIds = where.id.in;
      },
    },
  } as unknown as PriceHistoryRepositoryClient;

  await trimPriceHistory(7, client);

  assert.deepEqual(deletedIds, [1, 2]);
});
