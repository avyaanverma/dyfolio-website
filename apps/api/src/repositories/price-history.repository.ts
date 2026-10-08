import { prisma } from "../lib/prisma.js";

const MAX_HISTORY_POINTS = 30;

export type PriceHistoryRepositoryClient = Pick<typeof prisma, "priceHistory">;

export async function addPriceHistory(
  stockId: number,
  price: number,
  client: PriceHistoryRepositoryClient = prisma,
) {
  return client.priceHistory.create({
    data: { stockId, price },
  });
}

export async function getLatestPrice(
  stockId: number,
  client: PriceHistoryRepositoryClient = prisma,
): Promise<number | null> {
  const point = await client.priceHistory.findFirst({
    where: { stockId },
    orderBy: { recordedAt: "desc" },
    select: { price: true },
  });

  return point ? Number(point.price) : null;
}

export async function getPriceHistory(
  stockId: number,
  client: PriceHistoryRepositoryClient = prisma,
) {
  const points = await client.priceHistory.findMany({
    where: { stockId },
    orderBy: { recordedAt: "desc" },
    take: MAX_HISTORY_POINTS,
    select: { price: true, recordedAt: true },
  });

  return points.reverse().map((point) => ({
    price: Number(point.price),
    recordedAt: point.recordedAt,
  }));
}

export async function trimPriceHistory(
  stockId: number,
  client: PriceHistoryRepositoryClient = prisma,
) {
  const oldPoints = await client.priceHistory.findMany({
    where: { stockId },
    orderBy: { recordedAt: "desc" },
    skip: MAX_HISTORY_POINTS,
    select: { id: true },
  });

  if (oldPoints.length > 0) {
    await client.priceHistory.deleteMany({
      where: { id: { in: oldPoints.map((point) => point.id) } },
    });
  }
}
