-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('pix', 'money', 'credit', 'credit2x', 'credit3x', 'credit4x', 'credit5x', 'credit6x');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('paid', 'unpaid');

-- AlterTable
ALTER TABLE "public"."commands" ADD COLUMN     "paymentType" "public"."PaymentType";

-- CreateTable
CREATE TABLE "public"."financials" (
    "id" SERIAL NOT NULL,
    "accountName" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "vencimentDay" DATE NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL,

    CONSTRAINT "financials_pkey" PRIMARY KEY ("id")
);
