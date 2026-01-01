/*
  Warnings:

  - Added the required column `email` to the `BookingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;
