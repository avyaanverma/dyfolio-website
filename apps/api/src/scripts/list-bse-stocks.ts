import { prisma } from "../lib/prisma.js";

async function main() {
  const holdings = await prisma.holding.findMany({
    include: {
      stock: true,
    },
  });

  const bseStocks = holdings.filter((holding) =>
    /^\d+$/.test(holding.stock.exchangeCode),
  );

  console.table(
    bseStocks.map((holding) => ({
      name: holding.stock.name,
      exchangeCode: holding.stock.exchangeCode,
      sector: holding.stock.sector,
    })),
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });