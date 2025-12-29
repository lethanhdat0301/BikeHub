import { Prisma, PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ':' + derivedKey.toString('hex');
}

export async function seedUsers() {
  // Create admin user with hashed password
  const hashedPassword = await hashPassword('admin123');
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@bikehub.com',
      password: hashedPassword,
      role: 'admin',
      birthdate: new Date('1990-01-01'),
      phone: '0123456789',
      image: 'https://i.pravatar.cc/150?img=1',
    },
  });
  console.log(`Created admin user with email: ${adminUser.email} and password: admin123`);

  const users = faker.helpers.multiple(createRandomUser, { count: 15 });  const createdUsers = [adminUser];

  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: user as Prisma.UserCreateInput,
    });
    createdUsers.push(createdUser);
    console.log(`Created user with ID: ${createdUser.id}`);
  }

  return createdUsers;
}

function createRandomUser(): Partial<User> {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    birthdate: faker.date.past(),
    phone: faker.phone.number(),
    image: faker.image.avatar(),
  };
}
