-- AlterTable
ALTER TABLE "Dealer" ADD COLUMN     "park_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Dealer" ADD CONSTRAINT "Dealer_park_id_fkey" FOREIGN KEY ("park_id") REFERENCES "Park"("id") ON DELETE CASCADE ON UPDATE CASCADE;
