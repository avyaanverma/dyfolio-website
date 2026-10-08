import { prisma } from "../lib/prisma.js";

const MAX_HISTORY_POINTS = 30;

export async function addPriceHistory(stockId: number, price: number) {
  return prisma.priceHistory.create({
    data: {
      stockId,
      price,
    },
  });
}

export async function getPriceHistory(stockId: number) {
  const history = await prisma.priceHistory.findMany({
    where: {
      stockId,
    },
    orderBy: {
      recordedAt: "asc",
    },
    take: MAX_HISTORY_POINTS,
    select: {
      price: true,
      recordedAt: true,
    },
  });

  return history.map((point) => ({
    price: Number(point.price),
    recordedAt: point.recordedAt,
  }));
}

export async function trimPriceHistory(stockId: number) {
  const oldPoints = await prisma.priceHistory.findMany({
    where: {
      stockId,
    },
    orderBy: {
      recordedAt: "desc",
    },
    skip: MAX_HISTORY_POINTS,
    select: {
      id: true,
    },
  });

  if (oldPoints.length === 0) {
    return;
  }

  await prisma.priceHistory.deleteMany({
    where: {
      id: {
        in: oldPoints.map((point) => point.id),
      },
    },
  });
}
