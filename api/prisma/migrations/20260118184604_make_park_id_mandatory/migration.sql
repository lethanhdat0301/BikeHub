/*
  Warnings:

  - Made the column `park_id` on table `Dealer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Dealer" ALTER COLUMN "park_id" SET NOT NULL;
