import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedDealers(prisma: PrismaClient, dealerUsers: User[]) {
    // Create Dealer business profiles for dealer users
    const dealerProfiles = [
        {
            name: 'Phú Quốc Motorbike Rental',
            location: 'Phu Quoc Island',
            total_revenue: 12234.56,
            platform_fee: 205.5,
            current_debt: 250.75,
            last_payment_date: new Date('2024-06-28'),
            vehicle_count: 5,
        },
        {
            name: 'Nha Trang Adventure Bikes',
            location: 'Nha Trang City',
            total_revenue: 8540.0,
            platform_fee: 435.0,
            current_debt: 0,
            last_payment_date: new Date('2024-07-15'),
            vehicle_count: 8,
        },
        {
            name: 'Hà Giang Loop Motors',
            location: 'Ha Giang Province',
            total_revenue: 15350.25,
            platform_fee: 615.0,
            current_debt: 0,
            last_payment_date: new Date('2024-07-20'),
            vehicle_count: 12,
        },
        {
            name: 'Hồ Chí Minh City Riders',
            location: 'Ho Chi Minh City',
            total_revenue: 20000.0,
            platform_fee: 800.0,
            current_debt: 500.0,
            last_payment_date: new Date('2024-07-10'),
            vehicle_count: 15,
        },
        {
            name: 'Đà Nẵng Bike Station',
            location: 'Da Nang City',
            total_revenue: 10500.0,
            platform_fee: 420.0,
            current_debt: 0,
            last_payment_date: new Date('2024-07-18'),
            vehicle_count: 10,
        },
    ];

    for (let i = 0; i < dealerUsers.length && i < dealerProfiles.length; i++) {
        const dealerUser = dealerUsers[i];
        const profileData = dealerProfiles[i];

        // Find park by location (parks should be created by parks.seed.ts first)
        const park = await prisma.park.findFirst({
            where: { 
                location: {
                    contains: profileData.location
                }
            }
        });

        if (!park) {
            console.warn(`⚠️ No park found for location: ${profileData.location}. Skipping dealer ${profileData.name}`);
            continue;
        }

        await prisma.dealer.upsert({
            where: { user_id: dealerUser.id },
            update: {},
            create: {
                User: {
                    connect: { id: dealerUser.id }
                },
                Park: {
                    connect: { id: park.id }
                },
                name: profileData.name,
                email: dealerUser.email, // Use same email from User
                phone: dealerUser.phone || faker.phone.number(),
                telegram: `@${dealerUser.name.toLowerCase().replace(/\s+/g, '_')}`,
                location: profileData.location,
                status: 'Active',
                total_revenue: profileData.total_revenue,
                platform_fee: profileData.platform_fee,
                current_debt: profileData.current_debt,
                last_payment_date: profileData.last_payment_date,
                vehicle_count: profileData.vehicle_count,
                image: dealerUser.image || faker.image.avatar(),
            },
        });
    }

    console.log(`✅ Seeded: ${Math.min(dealerUsers.length, dealerProfiles.length)} Dealer Profiles`);
}
