/*
  Warnings:

  - Added the required column `instagram` to the `Clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Clients" ADD COLUMN     "instagram" TEXT NOT NULL;
