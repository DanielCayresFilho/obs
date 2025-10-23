/*
  Warnings:

  - Added the required column `usable` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `used` to the `StockMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "usable" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."StockMovement" ADD COLUMN     "used" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "length" DROP NOT NULL;
