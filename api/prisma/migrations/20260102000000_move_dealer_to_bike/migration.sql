-- Add dealer_id to Bike and remove dealer_id from Park
ALTER TABLE "Bike" ADD COLUMN "dealer_id" INTEGER;
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove dealer_id from Park (if exists)
ALTER TABLE "Park" DROP CONSTRAINT IF EXISTS "Park_dealer_id_fkey";
ALTER TABLE "Park" DROP COLUMN IF EXISTS "dealer_id";
