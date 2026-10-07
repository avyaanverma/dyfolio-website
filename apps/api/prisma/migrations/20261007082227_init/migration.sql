-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exchangeCode" INTEGER NOT NULL,
    "sector" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Holding_stockId_key" ON "Holding"("stockId");

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
