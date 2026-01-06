import { PrismaClient } from '@prisma/client';

export async function seedBookings(prisma: PrismaClient) {
  const bookingsData = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      contact_method: 'email',
      contact_details: 'alice@example.com',
      pickup_location: 'Downtown Park',
      status: 'PENDING',
    },
    {
      name: 'Bob Martinez',
      email: 'bob@example.com',
      contact_method: 'phone',
      contact_details: '+84123456789',
      pickup_location: 'Central Station',
      status: 'PENDING',
    },
    {
      name: 'Charlie Nguyen',
      email: 'charlie@example.com',
      contact_method: 'whatsapp',
      contact_details: '+84987654321',
      pickup_location: 'East Park',
      status: 'APPROVED',
    },
    {
      name: 'Dana Lee',
      email: 'dana@example.com',
      contact_method: 'phone',
      contact_details: '+84111222333',
      pickup_location: 'South Pier',
      status: 'REJECTED',
    },
    {
      name: 'Evan Kim',
      email: 'evan@example.com',
      contact_method: 'email',
      contact_details: 'evan@example.com',
      pickup_location: 'North Gate',
      status: 'PENDING',
    },
  ];

  const created = [];
  for (const b of bookingsData) {
    const rec = await prisma.bookingRequest.create({ data: b });
    created.push(rec);
    console.log(`✅ Created booking request ${rec.id}`);
  }

  return created;
}
