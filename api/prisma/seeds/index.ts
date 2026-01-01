import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedParks } from './parks.seed';
import { seedBikes } from './bikes.seed';
import { seedRentals } from './rentals.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Start seeding...');

  // 1. Users (Admin + Dealers + Customers)
  const { dealers, users } = await seedUsers(prisma);

  // 2. Parks (Gắn với Dealers)
  const parks = await seedParks(prisma, dealers);

  // 3. Bikes (Gắn với Parks)
  const bikes = await seedBikes(prisma, parks);

  // 4. Rentals (Gắn với Users & Bikes)
  if (bikes) {
    await seedRentals(prisma, users, bikes);
  }

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