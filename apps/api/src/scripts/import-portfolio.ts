import "dotenv/config";
import XLSX from "xlsx";
import { prisma } from "../lib/prisma.js";

// --------------------------------------------------
// 1. Read Excel file
// --------------------------------------------------

const workbook = XLSX.readFile(
  "data/F9001561_ADDBA737E8_B72562937A.xlsx"
);

const sheetName = workbook.SheetNames[0];

if (!sheetName) {
  throw new Error("Sheet not found");
}

const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  throw new Error("Worksheet not found");
}

// Convert worksheet into rows
const rows = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: null,
});

console.log("Sheet:", sheetName);
console.log("Total rows:", rows.length);

// --------------------------------------------------
// 2. Track current sector
// --------------------------------------------------

let sector = "";

// --------------------------------------------------
// 3. Process portfolio
// --------------------------------------------------

async function importPortfolio() {
  try {
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i] as unknown[];

      const particulars = row[1];
      const purchasePrice = row[2];
      const quantity = row[3];
      const rawExchangeCode = row[6];

      // --------------------------------------------
      // Skip empty rows
      // --------------------------------------------

      if (!particulars) {
        continue;
      }

      // --------------------------------------------
      // Sector row
      // --------------------------------------------

      if (
        purchasePrice == null &&
        quantity == null &&
        rawExchangeCode == null
      ) {
        sector = String(particulars).trim();

        console.log(`\nSector: ${sector}`);

        continue;
      }

      // --------------------------------------------
      // Validate stock row
      // --------------------------------------------

      if (
        purchasePrice == null ||
        quantity == null ||
        rawExchangeCode == null ||
        !sector
      ) {
        console.warn(
          `Skipping invalid row ${i + 1}:`,
          row
        );

        continue;
      }

      // --------------------------------------------
      // Normalize values
      // --------------------------------------------

      const name = String(particulars).trim();

      const exchangeCode = String(rawExchangeCode).trim();

      const price = String(purchasePrice);

      const qty = Number(quantity);

      // --------------------------------------------
      // Find existing stock
      // --------------------------------------------

      let stock = await prisma.stock.findFirst({
        where: {
          exchangeCode,
        },
      });

      // --------------------------------------------
      // Create stock if it doesn't exist
      // --------------------------------------------

      if (!stock) {
        stock = await prisma.stock.create({
          data: {
            name,
            exchangeCode,
            sector,
          },
        });

        console.log(`Created stock: ${name}`);
      } else {
        console.log(`Stock already exists: ${name}`);
      }

      // --------------------------------------------
      // Create/update holding
      // --------------------------------------------

      await prisma.holding.upsert({
        where: {
          stockId: stock.id,
        },

        update: {
          purchasePrice: price,
          quantity: qty,
        },

        create: {
          stockId: stock.id,
          purchasePrice: price,
          quantity: qty,
        },
      });

      // --------------------------------------------
      // Log imported data
      // --------------------------------------------

      console.log({
        name,
        sector,
        purchasePrice: price,
        quantity: qty,
        exchangeCode,
      });
    }

    console.log("\nPortfolio import completed successfully.");
  } catch (error) {
    console.error("\nPortfolio import failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

// --------------------------------------------------
// 4. Start import
// --------------------------------------------------

importPortfolio();