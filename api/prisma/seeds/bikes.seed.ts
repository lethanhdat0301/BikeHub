import { PrismaClient, Park, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedBikes(
  prisma: PrismaClient,
  parks: Park[],
  users: User[]
) {
  const bikes = [];

  for (let i = 0; i < 50; i++) {
    const park = parks[Math.floor(Math.random() * parks.length)];
    const owner = users[Math.floor(Math.random() * users.length)];

    const bike = await prisma.bike.create({
      data: {
        model: faker.vehicle.model(),
        status: 'available',
        lock: false,
        location: faker.location.streetAddress(),
        price: faker.number.float({ min: 10, max: 50 }),
        image: faker.image.url(),
        Park: {
          connect: { id: park.id },
        },
      }

    });

    bikes.push(bike);
  }

  console.log('✅ Seeded Bikes');
  return bikes;
}
