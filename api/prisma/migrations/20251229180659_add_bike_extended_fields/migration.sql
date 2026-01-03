-- AlterTable
ALTER TABLE "Bike" ADD COLUMN     "dealer_contact" TEXT,
ADD COLUMN     "dealer_name" TEXT,
ADD COLUMN     "fuel_type" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "review_count" INTEGER DEFAULT 0,
ADD COLUMN     "seats" INTEGER,
ADD COLUMN     "transmission" TEXT;
