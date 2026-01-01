import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ':' + derivedKey.toString('hex');
}

export async function seedUsers(prisma: PrismaClient) {
  const password = await hashPassword('123456');

  // 1. Tạo Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@rentnride.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@rentnride.com',
      password,
      role: 'admin',
      phone: '0900000000',
      birthdate: new Date('1990-01-01'),
    },
  });

  // 2. Tạo 3 Dealer cụ thể cho 3 khu vực (Theo PRD)
  const dealerData = [
    { name: 'Phu Quoc Rental', email: 'dealer.pq@rentnride.com', phone: '0912345678' },
    { name: 'Nha Trang Easy Rider', email: 'dealer.nt@rentnride.com', phone: '0933444555' },
    { name: 'Ha Giang Loop Tour', email: 'dealer.hg@rentnride.com', phone: '0966777888' },
  ];

  const dealers: User[] = [];
  for (const d of dealerData) {
    const dealer = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        password,
        role: 'dealer',
        phone: d.phone,
        image: faker.image.avatar(),
        birthdate: faker.date.past({ years: 30 }),
      },
    });
    dealers.push(dealer);
  }

  // 3. Tạo 20 Khách hàng (Users) ngẫu nhiên
  const users: User[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password, // password chung là 123456
        role: 'user',
        phone: faker.phone.number(),
        image: faker.image.avatar(),
        birthdate: faker.date.past({ years: 30 }),
      },
    });
    users.push(user);
  }

  console.log(`✅ Seeded: 1 Admin, ${dealers.length} Dealers, ${users.length} Users`);
  return { dealers, users }; // Trả về để dùng cho file khác
}