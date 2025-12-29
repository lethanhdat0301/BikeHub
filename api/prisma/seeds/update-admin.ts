import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ':' + derivedKey.toString('hex');
}

async function updateAdminPassword() {
  const hashedPassword = await hashPassword('admin123');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bikehub.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      name: 'Admin User',
      email: 'admin@bikehub.com',
      password: hashedPassword,
      role: 'admin',
      birthdate: new Date('1990-01-01'),
      phone: '0123456789',
      image: 'https://i.pravatar.cc/150?img=1',
    },
  });

  console.log(`Admin user updated/created: ${admin.email}`);
  console.log(`You can now login with:`);
  console.log(`Email: admin@bikehub.com`);
  console.log(`Password: admin123`);
}

updateAdminPassword()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
