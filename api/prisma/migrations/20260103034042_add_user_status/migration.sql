/*
  Warnings:

  - You are about to drop the column `dealer_contact` on the `Bike` table. All the data in the column will be lost.
  - You are about to drop the column `dealer_name` on the `Bike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bike" DROP COLUMN "dealer_contact",
DROP COLUMN "dealer_name";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
