/*
  Warnings:

  - Added the required column `email` to the `BookingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "email" TEXT NOT NULL;
