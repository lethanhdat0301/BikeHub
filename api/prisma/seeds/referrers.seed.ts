import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedReferrers(prisma: PrismaClient) {
    const referrerData = [
        {
            name: 'Hotel ABC',
            phone: '0911222333',
            total_earnings: 50000,
            referral_count: 1,
            last_referral_date: new Date('2024-07-18'),
        },
        {
            name: 'Tour Guide John',
            phone: '0922333444',
            total_earnings: 150000,
            referral_count: 3,
            last_referral_date: new Date('2024-07-21'),
        },
        {
            name: 'Restaurant XYZ',
            phone: '0933444555',
            total_earnings: 100000,
            referral_count: 2,
            last_referral_date: new Date('2024-07-25'),
        },
    ];

    for (const referrer of referrerData) {
        await prisma.referrer.create({
            data: {
                ...referrer,
                image: faker.image.avatar(),
            },
        });
    }

    console.log(`✅ Seeded: ${referrerData.length} Referrers`);
}
