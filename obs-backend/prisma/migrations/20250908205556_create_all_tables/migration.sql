-- CreateEnum
CREATE TYPE "public"."StockType" AS ENUM ('sale', 'intern');

-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('input', 'output');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('done', 'waiting', 'canceled');

-- CreateEnum
CREATE TYPE "public"."commandStatus" AS ENUM ('waiting', 'open', 'closed');

-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."StockType" NOT NULL DEFAULT 'intern',
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "length" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" SERIAL NOT NULL,
    "idStock" INTEGER NOT NULL,
    "nameStock" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "length" DECIMAL(65,30) NOT NULL,
    "stockType" "public"."StockType" NOT NULL,
    "operational" BOOLEAN NOT NULL DEFAULT false,
    "movementType" "public"."MovementType" NOT NULL DEFAULT 'input',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandId" INTEGER,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."procedures" (
    "id" SERIAL NOT NULL,
    "procedureName" TEXT NOT NULL,
    "procedureType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "procedurePrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" SERIAL NOT NULL,
    "idProcedure" INTEGER NOT NULL,
    "procedure" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointment" "public"."AppointmentStatus" NOT NULL DEFAULT 'waiting',
    "commandId" INTEGER NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commands" (
    "id" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "userResponsibility" TEXT NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "commandStatus" "public"."commandStatus" NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stock_name_type_createdAt_idx" ON "public"."Stock"("name", "type", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_nameStock_operational_createdAt_idx" ON "public"."StockMovement"("nameStock", "operational", "createdAt");

-- CreateIndex
CREATE INDEX "procedures_procedureType_createdAt_idx" ON "public"."procedures"("procedureType", "createdAt");

-- CreateIndex
CREATE INDEX "appointments_procedure_appointmentDate_idx" ON "public"."appointments"("procedure", "appointmentDate");

-- CreateIndex
CREATE INDEX "commands_userResponsibility_createdAt_idx" ON "public"."commands"("userResponsibility", "createdAt");

-- CreateIndex
CREATE INDEX "Clients_name_phone_createdAt_idx" ON "public"."Clients"("name", "phone", "createdAt");

-- CreateIndex
CREATE INDEX "Users_username_email_createdAt_idx" ON "public"."Users"("username", "email", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "public"."commands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "public"."commands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
