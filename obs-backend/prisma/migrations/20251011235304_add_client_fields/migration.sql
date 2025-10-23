/*
  Warnings:

  - Added the required column `clienteName` to the `commands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idClient` to the `commands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."commands" ADD COLUMN     "clienteName" TEXT NOT NULL,
ADD COLUMN     "idClient" INTEGER NOT NULL;
