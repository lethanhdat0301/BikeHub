import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedParks } from './parks.seed';
import { seedBikes } from './bikes.seed';
import { seedRentals } from './rentals.seed';
import { seedBookings } from './bookings.seed';

const prisma = new PrismaClient();

async function main() {
  const users = await seedUsers(prisma);
  const parks = await seedParks(prisma, users);
  const bikes = await seedBikes(prisma, parks, users);
  await seedRentals(users, bikes);
  await seedBookings(prisma);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
