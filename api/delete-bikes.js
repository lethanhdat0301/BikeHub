const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteBikes() {
  try {
    const result = await prisma.bike.deleteMany({});
    console.log(`Deleted ${result.count} bikes`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteBikes();
