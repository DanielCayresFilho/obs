-- CreateEnum
CREATE TYPE "public"."BudgetStatus" AS ENUM ('pending', 'approved', 'rejected', 'converted');

-- CreateTable
CREATE TABLE "public"."budgets" (
    "id" SERIAL NOT NULL,
    "budgetName" TEXT NOT NULL,
    "idClient" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "idUser" INTEGER NOT NULL,
    "userResponsibility" TEXT NOT NULL,
    "description" TEXT,
    "procedures" TEXT NOT NULL,
    "estimatedPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "public"."BudgetStatus" NOT NULL DEFAULT 'pending',
    "validityDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedCommandId" INTEGER,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_clientName_status_createdAt_idx" ON "public"."budgets"("clientName", "status", "createdAt");
