/*
  Warnings:

  - You are about to drop the column `idProcedure` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `commandName` to the `commands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Clients" ADD COLUMN     "clientPicture" TEXT;

-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "userPicture" TEXT;

-- AlterTable
ALTER TABLE "public"."appointments" DROP COLUMN "idProcedure",
ADD COLUMN     "appointmentPicture" TEXT;

-- AlterTable
ALTER TABLE "public"."commands" ADD COLUMN     "commandName" TEXT NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 0,
ALTER COLUMN "totalPrice" SET DEFAULT 0;
