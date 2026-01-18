import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedParks } from './parks.seed';
import { seedBikes } from './bikes.seed';
import { seedRentals } from './rentals.seed';
import { seedDealers } from './dealers.seed';
import { seedReferrers } from './referrers.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Start seeding...');

  try {
    await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1;`);
    console.log('✅ Sequence "booking_id_seq" ensured.');
  } catch (error) {
    console.warn('⚠️ Could not create sequence (might already exist or not supported):', error);
  }

  // 1. Users (Admin + Dealers + Customers)
  const { dealers, users } = await seedUsers(prisma);

  // 2. Dealer business profiles (linked to dealer users)
  await seedDealers(prisma, dealers);

  // 3. Parks (Gắn với Dealers)
  const parks = await seedParks(prisma, dealers);

  // 4. Bikes (Gắn với Parks và Dealers thật)
  const bikes = await seedBikes(prisma, parks, { dealers, users });

  // 5. Rentals (Gắn với Users & Bikes)
  if (bikes) {
    await seedRentals(prisma, users, bikes);
  }

  // 6. Referrers
  await seedReferrers(prisma);

  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });