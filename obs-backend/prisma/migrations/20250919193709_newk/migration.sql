-- AlterEnum
ALTER TYPE "public"."PaymentType" ADD VALUE 'debit';

-- AlterTable
ALTER TABLE "public"."commands" ALTER COLUMN "paymentType" SET DEFAULT 'money';
