/*
  Warnings:

  - Added the optional column `email` to the `BookingRequest` table.

*/
-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "email" TEXT;

-- Update existing rows with a default email
UPDATE "BookingRequest" SET "email" = 'noreply@bikehub.com' WHERE "email" IS NULL;

-- Make email NOT NULL after setting defaults
ALTER TABLE "BookingRequest" ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;
