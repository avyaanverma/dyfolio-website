import { prisma } from "../lib/prisma.js";

export async function getPortfolioHoldings() {
  return prisma.holding.findMany({
    include: {
      stock: true,
    },
  });
}

export async function getStockIdForHolding(holdingId: number) {
  const holding = await prisma.holding.findUnique({
    where: { id: holdingId },
    select: { stockId: true },
  });

  return holding?.stockId ?? null;
}
