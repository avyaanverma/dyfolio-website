import { prisma } from "../lib/prisma.js";

export async function getPortfolioHoldings() {
  return prisma.holding.findMany({
    include: {
      stock: true,
    },
  });
}