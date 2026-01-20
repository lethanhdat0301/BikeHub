-- AlterTable
ALTER TABLE "Referrer" ADD COLUMN     "dealer_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Referrer" ADD CONSTRAINT "Referrer_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
