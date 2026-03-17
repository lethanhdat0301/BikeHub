/**
 * Script to update existing bike and user data with comprehensive English content
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingData() {
    console.log('🔄 Updating existing data...');

    try {
        // 1. Update bike information
        await updateBikes();

        // 2. Update user information
        await updateUsers();

        console.log('✅ Successfully completed data update');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function updateBikes() {
    const bikeData = [
        {
            model: 'Honda Wave 110i',
            description: 'Reliable and fuel-efficient scooter perfect for city touring. Automatic transmission with excellent handling for beginners.',
            fuel_type: 'gasoline',
            transmission: 'automatic',
            seats: 2,
            dealer_name: 'Saigon Motors',
            dealer_contact: '+84 90 123 4567'
        },
        {
            model: 'Yamaha Exciter 155',
            description: 'Sporty motorcycle ideal for adventure touring. Manual transmission with powerful engine for mountain roads.',
            fuel_type: 'gasoline',
            transmission: 'manual',
            seats: 2,
            dealer_name: 'Ha Giang Adventure',
            dealer_contact: '+84 91 234 5678'
        },
        {
            model: 'Honda Winner X',
            description: 'Modern sport bike with advanced features. Perfect balance of power and comfort for long-distance travel.',
            fuel_type: 'gasoline',
            transmission: 'manual',
            seats: 2,
            dealer_name: 'Nha Trang Riders',
            dealer_contact: '+84 92 345 6789'
        },
        {
            model: 'Honda Air Blade 150',
            description: 'Premium automatic scooter with spacious storage. Ideal for comfortable city exploration and shopping.',
            fuel_type: 'gasoline',
            transmission: 'automatic',
            seats: 2,
            dealer_name: 'Phu Quoc Rentals',
            dealer_contact: '+84 93 456 7890'
        },
        {
            model: 'Yamaha Jupiter',
            description: 'Classic and dependable motorcycle. Easy to ride with excellent fuel economy for budget-conscious travelers.',
            fuel_type: 'gasoline',
            transmission: 'manual',
            seats: 2,
            dealer_name: 'Da Nang Bikes',
            dealer_contact: '+84 94 567 8901'
        },
        {
            model: 'Suzuki Raider 150',
            description: 'Powerful sport bike with aggressive styling. High performance engine suitable for experienced riders.',
            fuel_type: 'gasoline',
            transmission: 'manual',
            seats: 2,
            dealer_name: 'Hoi An Motors',
            dealer_contact: '+84 95 678 9012'
        },
        {
            model: 'VinFast Klara A2',
            description: 'Modern electric scooter with smart connectivity. Eco-friendly and silent operation for urban mobility.',
            fuel_type: 'electric',
            transmission: 'automatic',
            seats: 2,
            dealer_name: 'Green Mobility VN',
            dealer_contact: '+84 96 789 0123'
        },
        {
            model: 'Honda PCX 160',
            description: 'Premium maxi-scooter with advanced technology. Spacious and comfortable for long-distance touring.',
            fuel_type: 'gasoline',
            transmission: 'automatic',
            seats: 2,
            dealer_name: 'Premium Scooters',
            dealer_contact: '+84 97 890 1234'
        },
        {
            model: 'Yamaha NVX 155',
            description: 'Sporty automatic scooter with racing DNA. Perfect blend of performance and practicality for daily use.',
            fuel_type: 'gasoline',
            transmission: 'automatic',
            seats: 2,
            dealer_name: 'Sport Scooter Hub',
            dealer_contact: '+84 98 901 2345'
        },
        {
            model: 'Honda CB150R',
            description: 'Neo sports cafe motorcycle with naked bike styling. Lightweight and agile for city and highway riding.',
            fuel_type: 'gasoline',
            transmission: 'manual',
            seats: 2,
            dealer_name: 'Street Fighters VN',
            dealer_contact: '+84 99 012 3456'
        }
    ];

    const bikes = await prisma.bike.findMany();

    for (let i = 0; i < bikes.length; i++) {
        const bike = bikes[i];
        const bikeInfo = bikeData[i % bikeData.length];

        // Generate realistic price based on bike type
        const basePrice = bikeInfo.fuel_type === 'electric' ? 25 :
            bikeInfo.transmission === 'automatic' ? 20 : 15;
        const price = basePrice + Math.floor(Math.random() * 30);

        await prisma.bike.update({
            where: { id: bike.id },
            data: {
                model: bikeInfo.model,
                description: bikeInfo.description,
                fuel_type: bikeInfo.fuel_type,
                transmission: bikeInfo.transmission,
                seats: bikeInfo.seats,
                dealer_name: bikeInfo.dealer_name,
                dealer_contact: bikeInfo.dealer_contact,
                price: price,
                location: `Slot ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 99) + 1}`,
                image: `https://picsum.photos/600/400?random=${i + 100}`,
            }
        });
    }
}

async function updateUsers() {
    // Update dealer information with English names
    const dealerUpdates = [
        { email: 'phuquoc@bikehub.vn', name: 'Phu Quoc Island Motorbike Rental' },
        { email: 'nhatrang@bikehub.vn', name: 'Nha Trang Adventure Bikes' },
        { email: 'hagiang@bikehub.vn', name: 'Ha Giang Loop Motorcycle Tours' },
        { email: 'saigon@bikehub.vn', name: 'Ho Chi Minh City Motorcycle Rental' },
        { email: 'danang@bikehub.vn', name: 'Da Nang Central Bike Station' },
    ];

    for (const update of dealerUpdates) {
        await prisma.user.updateMany({
            where: { email: update.email },
            data: { name: update.name }
        });
    }
}

updateExistingData();