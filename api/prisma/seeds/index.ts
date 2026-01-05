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

  // 1. Users (Admin + Dealers + Customers)
  const { dealers, users } = await seedUsers(prisma);

  // 2. Parks (Gắn với Dealers)
  const parks = await seedParks(prisma, dealers);

  // 3. Bikes (Gắn với Parks)
  const bikes = await seedBikes(prisma, parks, users);

  // 4. Rentals (Gắn với Users & Bikes)
  if (bikes) {
    await seedRentals(prisma, users, bikes);
  }

  // 5. Dealers
  await seedDealers(prisma);

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