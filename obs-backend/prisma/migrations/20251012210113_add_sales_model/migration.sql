/*
  Warnings:

  - A unique constraint covering the columns `[saleId]` on the table `StockMovement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."StockMovement" ADD COLUMN     "saleId" INTEGER,
ALTER COLUMN "movementType" SET DEFAULT 'output';

-- CreateTable
CREATE TABLE "public"."Sales" (
    "id" SERIAL NOT NULL,
    "idStock" INTEGER NOT NULL,
    "nameStock" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL DEFAULT 'money',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "clientId" INTEGER,
    "clientName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sales_nameStock_createdAt_idx" ON "public"."Sales"("nameStock", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_saleId_key" ON "public"."StockMovement"("saleId");

-- AddForeignKey
ALTER TABLE "public"."Sales" ADD CONSTRAINT "Sales_idStock_fkey" FOREIGN KEY ("idStock") REFERENCES "public"."Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
