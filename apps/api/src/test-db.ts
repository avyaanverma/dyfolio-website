import { prisma } from "./lib/prisma.js";

async function main() {
  const stock = await prisma.stock.findMany({});
  console.log("Stocks Present: ", stock);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
