-- DropForeignKey
ALTER TABLE "Park" DROP CONSTRAINT "Park_dealer_id_fkey";

-- AlterTable
ALTER TABLE "Park" ALTER COLUMN "dealer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Park" ADD CONSTRAINT "Park_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
