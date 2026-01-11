import { PrismaClient, Park, User } from '@prisma/client';

export async function seedParks(prisma: PrismaClient, dealers: User[]) {
  // Map dealer theo email để lấy đúng ID (Updated emails)
  const pqDealer = dealers.find(u => u.email === 'phuquoc@rentnride.vn');
  const ntDealer = dealers.find(u => u.email === 'nhatrang@rentnride.vn');
  const hgDealer = dealers.find(u => u.email === 'hagiang@rentnride.vn');
  const hcmDealer = dealers.find(u => u.email === 'saigon@rentnride.vn');
  const dnDealer = dealers.find(u => u.email === 'danang@rentnride.vn');

  if (!pqDealer || !ntDealer || !hgDealer || !hcmDealer || !dnDealer) {
    throw new Error("Missing Dealers. Please seed users first.");
  }

  const parksData = [
    {
      name: 'Phu Quoc Island Station',
      location: 'Phu Quoc Island, Kien Giang Province',
      dealer_id: pqDealer.id,
      image: 'https://picsum.photos/800/600?random=1'
    },
    {
      name: 'Nha Trang Central Station',
      location: 'Nha Trang City, Khanh Hoa Province',
      dealer_id: ntDealer.id,
      image: 'https://picsum.photos/800/600?random=2'
    },
    {
      name: 'Ha Giang Loop Station',
      location: 'Ha Giang City, Ha Giang Province',
      dealer_id: hgDealer.id,
      image: 'https://picsum.photos/800/600?random=3'
    },
    {
      name: 'Ho Chi Minh City Station',
      location: 'District 1, Ho Chi Minh City',
      dealer_id: hcmDealer.id,
      image: 'https://picsum.photos/800/600?random=4'
    },
    {
      name: 'Da Nang Coastal Station',
      location: 'Da Nang City, Central Vietnam',
      dealer_id: dnDealer.id,
      image: 'https://picsum.photos/800/600?random=5'
    },
  ];

  const createdParks: Park[] = [];

  for (const p of parksData) {
    // Dùng upsert để tránh tạo trùng nếu chạy seed nhiều lần
    const park = await prisma.park.findFirst({ where: { name: p.name } });

    if (park) {
      createdParks.push(park);
    } else {
      const newPark = await prisma.park.create({
        data: {
          name: p.name,
          location: p.location,
          image: p.image,
        }
      });
      createdParks.push(newPark);
    }
  }

  return createdParks;
}
