import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedDealers(prisma: PrismaClient) {
    const dealerData = [
        {
            name: 'Phu Quoc Motorbike Rentals',
            email: 'contact@pqmotorbikes.com',
            phone: '0987654321',
            telegram: '@pqmotorbikes_telegram',
            location: 'Phu Quoc',
            status: 'Active',
            total_revenue: 12234.56,
            platform_fee: 205.5,
            current_debt: 250.75,
            last_payment_date: new Date('2024-06-28'),
            vehicle_count: 5,
        },
        {
            name: 'Saigon Scooter Co.',
            email: 'info@saigonscooter.com',
            phone: '0123456789',
            telegram: '@saigonscooter_telegram',
            location: 'Ho Chi Minh City',
            status: 'Active',
            total_revenue: 8540.0,
            platform_fee: 435.0,
            current_debt: 0,
            last_payment_date: new Date('2024-07-15'),
            vehicle_count: 2,
        },
        {
            name: 'Hanoi Motorbikes',
            email: 'rentals@hanoimotorbikes.net',
            phone: '0912345678',
            telegram: '@hanoimotorbikes_telegram',
            location: 'Hanoi',
            status: 'Inactive',
            total_revenue: 4350.25,
            platform_fee: 315.0,
            current_debt: 120.0,
            last_payment_date: new Date('2024-05-10'),
            vehicle_count: 1,
        },
    ];

    for (const dealer of dealerData) {
        await prisma.dealer.upsert({
            where: { email: dealer.email },
            update: {},
            create: {
                ...dealer,
                image: faker.image.avatar(),
            },
        });
    }

    console.log(`✅ Seeded: ${dealerData.length} Dealers`);
}
