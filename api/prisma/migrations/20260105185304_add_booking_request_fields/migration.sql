-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "bike_id" INTEGER,
ADD COLUMN     "dealer_id" INTEGER,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "estimated_price" DOUBLE PRECISION,
ADD COLUMN     "start_date" TIMESTAMP(3);
