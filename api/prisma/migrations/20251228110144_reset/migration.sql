/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Bike` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_bike_id_fkey";

-- AlterTable
ALTER TABLE "Bike" DROP COLUMN "owner_id";

-- AddForeignKey
ALTER TABLE "Park" ADD CONSTRAINT "Park_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_bike_id_fkey" FOREIGN KEY ("bike_id") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;
