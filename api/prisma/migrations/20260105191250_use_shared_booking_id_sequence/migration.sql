-- Create shared sequence for booking IDs
CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1;

-- Get max ID from both tables and set sequence value
DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT GREATEST(
    COALESCE((SELECT MAX(id) FROM "BookingRequest"), 0),
    COALESCE((SELECT MAX(id) FROM "Rental"), 0)
  ) INTO max_id;
  
  -- Only set if there are existing records
  IF max_id > 0 THEN
    PERFORM setval('booking_id_seq', max_id);
  END IF;
END $$;

-- AlterTable BookingRequest
ALTER TABLE "BookingRequest" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "BookingRequest_id_seq";
ALTER TABLE "BookingRequest" ALTER COLUMN "id" SET DEFAULT nextval('booking_id_seq');

-- AlterTable Rental
ALTER TABLE "Rental" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "Rental_id_seq";
ALTER TABLE "Rental" ALTER COLUMN "id" SET DEFAULT nextval('booking_id_seq');
