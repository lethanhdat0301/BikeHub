import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthHelpers } from '../../src/shared/helpers/auth.helpers';

export async function seedUsers(prisma: PrismaClient) {
  const password = await AuthHelpers.hash('123456');
  const adminPassword = await AuthHelpers.hash('admin123');

  // 1. Tạo Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@rentnride.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@rentnride.com',
      password: adminPassword,
      role: 'admin',
      phone: '0900000000',
      birthdate: new Date('1990-01-01'),
    },
  });

  // 2. Tạo dealers cụ thể (Dữ liệu mới)
  const dealerData = [
    { name: 'Phú Quốc Motorbike Rental', email: 'phuquoc@rentnride.vn', phone: '0902123456' },
    { name: 'Nha Trang Adventure Bikes', email: 'nhatrang@rentnride.vn', phone: '0933456789' },
    { name: 'Hà Giang Loop Motors', email: 'hagiang@rentnride.vn', phone: '0966789012' },
    { name: 'Hồ Chí Minh City Riders', email: 'saigon@rentnride.vn', phone: '0977123456' },
    { name: 'Đà Nẵng Bike Station', email: 'danang@rentnride.vn', phone: '0988234567' },
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

  return { dealers, users };
}
