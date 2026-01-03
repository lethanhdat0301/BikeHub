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

    const bikeData: any = {
      model: faker.vehicle.model(),
      status: 'available',
      seats: faker.number.int({ min: 1, max: 5 }),
      lock: false,
      location: faker.location.streetAddress(),
      price: Number(faker.number.float({ min: 10, max: 50 }).toFixed(2)),
      image: faker.image.url(),
      Park: {
        connect: { id: park.id },
      },
      // Assign a dealer (owner) to the bike (use relation connect)
      Dealer: {
        connect: { id: owner.id },
      },
    };

    const bike = await prisma.bike.create({ data: bikeData });

    bikes.push(bike);
  }

  console.log(`✅ Seeded ${createdBikes.length} Bikes`);
  return createdBikes;
}