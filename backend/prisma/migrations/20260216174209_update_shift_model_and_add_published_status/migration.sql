/*
  Warnings:

  - The values [GENERATED] on the enum `ShiftMonthStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `shifts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shift_month_id,date,slot]` on the table `shifts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shift_month_id` to the `shifts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShiftMonthStatus_new" AS ENUM ('OPEN', 'CLOSED', 'PUBLISHED');
ALTER TABLE "public"."shift_months" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "shift_months" ALTER COLUMN "status" TYPE "ShiftMonthStatus_new" USING ("status"::text::"ShiftMonthStatus_new");
ALTER TYPE "ShiftMonthStatus" RENAME TO "ShiftMonthStatus_old";
ALTER TYPE "ShiftMonthStatus_new" RENAME TO "ShiftMonthStatus";
DROP TYPE "public"."ShiftMonthStatus_old";
ALTER TABLE "shift_months" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_user_id_fkey";

-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "status",
ADD COLUMN     "is_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shift_month_id" TEXT NOT NULL,
ADD COLUMN     "slot" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "ShiftStatus";

-- CreateIndex
CREATE UNIQUE INDEX "shifts_shift_month_id_date_slot_key" ON "shifts"("shift_month_id", "date", "slot");

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_shift_month_id_fkey" FOREIGN KEY ("shift_month_id") REFERENCES "shift_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
