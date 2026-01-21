import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seed';
import { seedParks } from './parks.seed';

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

  // 2. Parks
  await seedParks(prisma, dealers);

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