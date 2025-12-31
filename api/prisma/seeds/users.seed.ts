import { Prisma, PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedUsers(prisma: PrismaClient) {
  const usersData = faker.helpers.multiple(createRandomUser, { count: 15 });
  const createdUsers: User[] = [];

  for (const user of usersData) {
    const createdUser = await prisma.user.create({
      data: user as Prisma.UserCreateInput,
    });
    createdUsers.push(createdUser);
    console.log(`✅ Created user ${createdUser.id}`);
  }

  return createdUsers;
}

function createRandomUser(): Partial<User> {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    birthdate: faker.date.past({ years: 30 }),
    phone: faker.phone.number(),
    image: faker.image.avatar(),
    role: 'dealer', // 👈 để làm Dealer cho Park
  };
}
