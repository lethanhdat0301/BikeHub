-- AlterTable: Add dealer_id column to Bike table
ALTER TABLE "Bike" ADD COLUMN IF NOT EXISTS "dealer_id" INTEGER;

-- AddForeignKey: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Bike_dealer_id_fkey'
    ) THEN
        ALTER TABLE "Bike" ADD CONSTRAINT "Bike_dealer_id_fkey" 
        FOREIGN KEY ("dealer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
