const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBikes() {
  try {
    const bikes = await prisma.bike.findMany({
      take: 5,
      select: {
        id: true,
        model: true,
        license_plate: true,
      }
    });
    console.log('Bikes in database:');
    console.log(JSON.stringify(bikes, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBikes();
