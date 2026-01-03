import { Prisma, PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthHelpers } from '../../src/shared/helpers/auth.helpers';

export async function seedUsers(prisma: PrismaClient) {
  const createdUsers: User[] = [];

  // Create a fixed admin user for testing
  const adminPassword = await AuthHelpers.hash('abc12345');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'admin',
      birthdate: new Date('1990-01-01'),
      phone: '0000000000',
      status: 'active',
    },
  });
  const dealer_1 = await prisma.user.create({
    data: {
      name: 'Dealer 1',
      email: 'dealer1@gmail.com',
      password: adminPassword,
      role: 'dealer',
      birthdate: new Date('1990-01-01'),
      phone: '0000000000', 
      status: 'active',
    },
  });
  const dealer_2 = await prisma.user.create({
    data: {
      name: 'Dealer 2',
      email: 'dealer2@gmail.com',
      password: adminPassword,
      role: 'dealer',
      birthdate: new Date('1990-01-01'),
      phone: '0000000000',
      status: 'active',
    },
  });
  createdUsers.push(admin);
  createdUsers.push(dealer_1);
  createdUsers.push(dealer_2);
  console.log(`✅ Created admin user ${admin.id} (${admin.email})`);

  // Create several random dealer users and some customers
  const usersData = faker.helpers.multiple(createRandomUser, { count: 14 });
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
    role: faker.helpers.arrayElement(['dealer', 'user']),
  };
}
