import { PrismaClient, Park } from '@prisma/client';

export async function seedBikes(prisma: PrismaClient, parks: Park[]) {
  // Tìm ID của các bãi xe vừa tạo
  const pqPark = parks.find(p => p.location.includes('Phú Quốc'));
  const ntPark = parks.find(p => p.location.includes('Nha Trang'));
  const hgPark = parks.find(p => p.location.includes('Hà Giang'));

  if (!pqPark || !ntPark || !hgPark) return;

  // Data chuẩn 20 xe
  const rawBikes = [
    // --- PHÚ QUỐC ---
    {
      model: 'Honda Vision 2023',
      parkId: pqPark.id,
      price: 120000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=400',
      description: 'A modern and stylish scooter perfect for city tours. The Honda Vision 2023 features a fuel-efficient engine, comfortable seating, and ample storage space for your belongings.'
    },
    {
      model: 'Honda Air Blade 160',
      parkId: pqPark.id,
      price: 150000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      description: 'Experience powerful performance with the Honda Air Blade 160. This sporty scooter offers excellent handling, advanced braking system, and a sleek design for those who appreciate both style and performance.'
    },
    {
      model: 'Yamaha Janus',
      parkId: pqPark.id,
      price: 110000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=400',
      description: 'Compact and easy to ride, the Yamaha Janus is perfect for beginners. This lightweight scooter offers excellent fuel economy and maneuverability in traffic, making it ideal for exploring the island.'
    },
    {
      model: 'Honda Lead 125',
      parkId: pqPark.id,
      price: 160000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400',
      description: 'The Honda Lead 125 combines comfort and practicality with its spacious design and smooth automatic transmission. Features include a large under-seat storage compartment and excellent stability.'
    },
    {
      model: 'VinFast Klara S',
      parkId: pqPark.id,
      price: 180000,
      type: 'Electric',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      description: 'Go green with the VinFast Klara S electric scooter. Zero emissions, silent operation, and low running costs make this an eco-friendly choice. Perfect for environmentally conscious travelers.'
    },
    {
      model: 'Honda SH Mode',
      parkId: pqPark.id,
      price: 250000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400',
      description: 'Premium comfort meets Italian-inspired design in the Honda SH Mode. This upscale scooter features a powerful engine, comfortable suspension, and elegant styling for discerning riders.'
    },
    {
      model: 'Yamaha NVX 155',
      parkId: pqPark.id,
      price: 200000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=400',
      description: 'The Yamaha NVX 155 is a sporty scooter with exceptional performance. Features include VVA engine technology, LED lighting, and a digital instrument panel. Perfect for those who want speed and style.'
    },

    // --- NHA TRANG ---
    {
      model: 'Yamaha Grande',
      parkId: ntPark.id,
      price: 140000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      description: 'Elegant and refined, the Yamaha Grande offers a smooth ride with its Blue Core engine technology. This premium scooter is perfect for cruising along the beautiful Nha Trang coastline.'
    },
    {
      model: 'Honda Wave Alpha',
      parkId: ntPark.id,
      price: 80000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=400',
      description: 'A reliable and economical choice, the Honda Wave Alpha is Vietnam\'s most popular bike. Easy to ride with manual transmission, excellent fuel efficiency, and proven durability.'
    },
    {
      model: 'Honda Blade 110',
      parkId: ntPark.id,
      price: 90000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400',
      description: 'The Honda Blade 110 is a versatile manual bike combining sportiness with practicality. Features include a powerful engine, sporty design, and excellent handling for city riding.'
    },
    {
      model: 'Honda PCX 160',
      parkId: ntPark.id,
      price: 250000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400',
      description: 'Premium touring scooter with exceptional comfort and features. The Honda PCX 160 offers smart key system, ABS braking, and a spacious design perfect for long rides along the coast.'
    },
    {
      model: 'Vespa Primavera',
      parkId: ntPark.id,
      price: 350000,
      type: 'Automatic',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400',
      description: 'Experience Italian luxury with the iconic Vespa Primavera. This classic scooter combines timeless design with modern technology, offering a unique and stylish way to explore Nha Trang.'
    },
    {
      model: 'Honda Future 125',
      parkId: ntPark.id,
      price: 110000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=400',
      description: 'The Honda Future 125 is a practical manual bike designed for everyday use. Known for its reliability, fuel efficiency, and low maintenance costs, it\'s perfect for budget-conscious travelers.'
    },

    // --- HÀ GIANG ---
    {
      model: 'Honda XR 150L',
      parkId: hgPark.id,
      price: 450000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      description: 'Conquer the legendary Hà Giang Loop with this rugged off-road bike. The Honda XR 150L features high ground clearance, knobby tires, and a powerful engine perfect for mountain roads and challenging terrain.'
    },
    {
      model: 'Honda Winner X',
      parkId: hgPark.id,
      price: 200000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=400',
      description: 'A sporty and powerful naked bike ideal for winding mountain roads. The Honda Winner X offers great handling, responsive acceleration, and comfort for long-distance touring through Hà Giang.'
    },
    {
      model: 'Yamaha Exciter 155',
      parkId: hgPark.id,
      price: 210000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400',
      description: 'The Yamaha Exciter 155 is a high-performance sport bike perfect for adventurous riders. VVA technology, LED lighting, and excellent suspension make it ideal for tackling the challenging Hà Giang Loop.'
    },
    {
      model: 'Honda Wave RSX',
      parkId: hgPark.id,
      price: 100000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400',
      description: 'A reliable and economical option for exploring Hà Giang. The Honda Wave RSX offers good fuel efficiency, easy handling, and proven durability for riders on a budget.'
    },
    {
      model: 'Honda CRF 250L',
      parkId: hgPark.id,
      price: 600000,
      type: 'Manual',
      seats: 1,
      image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=400',
      description: 'A true adventure bike built for serious off-road riding. The Honda CRF 250L features long-travel suspension, powerful engine, and excellent ground clearance for the most challenging mountain trails.'
    },
    {
      model: 'Royal Enfield Classic 350',
      parkId: hgPark.id,
      price: 800000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400',
      description: 'Experience vintage charm meets modern reliability. The Royal Enfield Classic 350 offers a unique riding experience with its retro styling and thumping engine, perfect for leisurely exploring Hà Giang\'s scenic routes.'
    },
    {
      model: 'Suzuki GD110',
      parkId: hgPark.id,
      price: 180000,
      type: 'Manual',
      seats: 2,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      description: 'The Suzuki GD110 is a sturdy and dependable bike ideal for mountain touring. Known for excellent fuel economy and reliability, it\'s a great choice for riders wanting a balance of performance and affordability.'
    },
  ];

  const createdBikes = [];
  for (const bike of rawBikes) {
    const b = await prisma.bike.create({
      data: {
        model: bike.model,
        status: 'available',
        lock: false,
        location: bike.parkId === pqPark.id ? 'Phú Quốc' : (bike.parkId === ntPark.id ? 'Nha Trang' : 'Hà Giang'),
        price: bike.price,
        image: bike.image,
        description: bike.description,
        Park: { connect: { id: bike.parkId } },
        transmission: bike.type,
        seats: bike.seats,
        fuel_type: bike.type === 'Electric' ? 'electric' : 'gasoline',
      }
    });
    createdBikes.push(b);
  }

  console.log(`✅ Seeded ${createdBikes.length} Bikes`);
  return createdBikes;
}