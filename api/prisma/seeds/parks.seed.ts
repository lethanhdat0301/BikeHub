import { Prisma, PrismaClient, Park, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedParks(
  prisma: PrismaClient,
  users: User[]
) {
  const createdParks: Park[] = [];

  const moroccanCities = [
    'Casablanca','Rabat','Fes','Marrakech','Tangier','Agadir','Meknes',
    'Oujda','Kenitra','Tetouan','Safi','El Jadida','Taza','Nador','Settat',
    'Khouribga','Beni Mellal','Errachidia','Tiznit','Larache','Ksar El Kebir',
    'Guelmim','Essaouira','Al Hoceima','Lagouira','Tan-Tan','Sidi Ifni',
    'Tata','Dakhla',
  ];

  const shuffledCities = faker.helpers.shuffle(moroccanCities);

  for (let i = 0; i < shuffledCities.length; i++) {
    const dealer = users[i % users.length]; // 👈 chọn dealer

    const parkData = createRandomPark(shuffledCities[i]);
    if (!parkData) continue;

    const createdPark = await prisma.park.create({
      data: {
        ...parkData,
      },
    });

    createdParks.push(createdPark);
    console.log(`✅ Created park ${createdPark.id}`);
  }

  return createdParks;
}

function createRandomPark(city: string): Omit<Park, 'id' | 'created_at' | 'updated_at' | 'dealer_id'> {
    return {
      name: `${city} Park`,
      location: faker.location.streetAddress(),
      image: faker.image.urlLoremFlickr({ category: 'city' }),
    };
  }
