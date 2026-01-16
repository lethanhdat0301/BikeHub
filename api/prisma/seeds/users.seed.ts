import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthHelpers } from '../../src/shared/helpers/auth.helpers';

export async function seedUsers(prisma: PrismaClient) {
  const password = await AuthHelpers.hash('123456');
  const adminPassword = await AuthHelpers.hash('Cho-Thue-XeMay-2026!^*');

  // 1. Tạo 3 Super Admin
  const admins = [
    {
      email: 'admin1@rentnride.com',
      name: 'Super Admin 1',
      phone: '0900000001',
    },
    {
      email: 'admin2@rentnride.com',
      name: 'Super Admin 2',
      phone: '0900000002',
    },
    {
      email: 'admin3@rentnride.com',
      name: 'Super Admin 3',
      phone: '0900000003',
    },
  ];

await Promise.all(
  admins.map((admin) =>
    prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password: adminPassword,
        role: 'admin',
        phone: admin.phone,
        birthdate: new Date('1990-01-01'),
      },
    })
  )
);

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
  // 3. Khai báo user
  const users: User[] = [];

  return { dealers, users };
}
