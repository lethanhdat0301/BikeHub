import { PrismaClient, User, Bike } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedRentals(prisma: PrismaClient, users: User[], bikes: Bike[]) {
  if (users.length === 0 || bikes.length === 0) return;

  const rentals = [];

  // Chỉ lấy users đóng vai trò khách hàng (không lấy admin/dealer)
  const customers = users.filter(u => u.role === 'user');

  for (const user of customers) {
    // Mỗi khách thuê 1-3 lần
    const numRentals = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numRentals; i++) {
      const bike = faker.helpers.arrayElement(bikes);
      const startTime = faker.date.past();
      const endTime = new Date(startTime.getTime() + (2 * 24 * 60 * 60 * 1000)); // Thuê 2 ngày

      const rental = await prisma.rental.create({
        data: {
          user_id: user.id,
          bike_id: bike.id,
          start_time: startTime,
          end_time: endTime,
          status: faker.helpers.arrayElement(['completed', 'ongoing', 'cancelled']),
          price: bike.price * 2, // Giá 2 ngày
          qrcode: '',
        }
      });
      rentals.push(rental);
    }
  }
  console.log(`✅ Seeded ${rentals.length} Rentals`);
}