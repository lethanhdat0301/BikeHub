import { PrismaClient, Park, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedBikes(
  prisma: PrismaClient,
  parks: Park[],
  users: User[]
) {
  const bikes = [];

  // Comprehensive motorcycle data for Vietnam rental market
  const vietnamBikes = [
    {
      model: 'Honda Wave 110i',
      description: 'The most popular automatic scooter in Vietnam. Reliable, fuel-efficient and perfect for city exploration. Easy to ride for beginners with comfortable seating.',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      seats: 2,
      basePrice: 12
    },
    {
      model: 'Yamaha Exciter 155',
      description: 'Sporty motorcycle ideal for adventure touring and mountain roads. Manual transmission with powerful engine, perfect for Ha Giang Loop and countryside exploration.',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 2,
      basePrice: 18
    },
    {
      model: 'Honda Winner X',
      description: 'Modern sport bike combining performance with comfort. Advanced features and stylish design, suitable for both city riding and long-distance touring.',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 2,
      basePrice: 20
    },
    {
      model: 'Honda Air Blade 150',
      description: 'Premium automatic scooter with spacious under-seat storage. Ideal for shopping trips and comfortable city exploration with excellent fuel economy.',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      seats: 2,
      basePrice: 16
    },
    {
      model: 'Yamaha Jupiter',
      description: 'Classic and dependable motorcycle favored by locals. Manual transmission with excellent reliability and low maintenance costs, perfect for budget travelers.',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 2,
      basePrice: 10
    },
    {
      model: 'Suzuki Raider 150',
      description: 'High-performance sport bike with aggressive styling. Powerful engine and responsive handling, recommended for experienced riders seeking thrills.',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 2,
      basePrice: 22
    },
    {
      model: 'VinFast Klara A2',
      description: 'Modern electric scooter with smart connectivity features. Eco-friendly, silent operation with smartphone integration. Perfect for environmentally conscious riders.',
      fuel_type: 'electric',
      transmission: 'automatic',
      seats: 2,
      basePrice: 25
    },
    {
      model: 'Honda PCX 160',
      description: 'Premium maxi-scooter with advanced technology and superior comfort. Large storage capacity and weather protection, ideal for luxury touring.',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      seats: 2,
      basePrice: 28
    },
    {
      model: 'Yamaha NVX 155',
      description: 'Sporty automatic scooter with racing DNA. Advanced features including ABS and smart key. Perfect balance of performance and daily practicality.',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      seats: 2,
      basePrice: 24
    },
    {
      model: 'Honda CB150R',
      description: 'Neo sports cafe motorcycle with distinctive naked bike styling. Lightweight, agile handling perfect for both urban commuting and weekend adventures.',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 2,
      basePrice: 26
    }
  ];

  const dealerNames = [
    'Saigon Premium Motors', 'Hanoi Adventure Bikes', 'Da Nang Central Rentals',
    'Nha Trang Coastal Riders', 'Phu Quoc Island Motors', 'Hoi An Classic Bikes',
    'Ha Long Bay Rentals', 'Sapa Mountain Bikes', 'Can Tho Delta Tours',
    'Vung Tau Beach Scooters'
  ];

  for (let i = 0; i < 50; i++) {
    const park = parks[Math.floor(Math.random() * parks.length)];
    const dealer = users[Math.floor(Math.random() * users.length)];
    const bikeTemplate = vietnamBikes[i % vietnamBikes.length];
    const dealerName = dealerNames[Math.floor(Math.random() * dealerNames.length)];

    const bikeData: any = {
      model: bikeTemplate.model,
      status: 'available',
      seats: bikeTemplate.seats,
      lock: false,
      location: `Parking Slot ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 99) + 1}`,
      price: Number((bikeTemplate.basePrice + Math.random() * 15).toFixed(2)),
      image: `https://picsum.photos/600/400?random=${i + 1}`,
      description: bikeTemplate.description,
      fuel_type: bikeTemplate.fuel_type,
      transmission: bikeTemplate.transmission,
      dealer_name: dealerName,
      dealer_contact: `+84 ${90 + Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      Park: {
        connect: { id: park.id },
      },
      Dealer: {
        connect: { id: dealer.id },
      },
    };

    const bike = await prisma.bike.create({ data: bikeData });
    bikes.push(bike);
  }

  console.log(`✅ Seeded ${bikes.length} Bikes with comprehensive English data`);
  return bikes;
}