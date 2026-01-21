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

  console.log('✅ Created 3 Super Admins');
  console.log('ℹ️  Dealers will be created by admin in production');

  return { admins };
}
