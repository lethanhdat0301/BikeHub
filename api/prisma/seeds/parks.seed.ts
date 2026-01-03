import { PrismaClient, Park, User } from '@prisma/client';

export async function seedParks(prisma: PrismaClient, dealers: User[]) {
  // Map dealer theo email để lấy đúng ID
  const pqDealer = dealers.find(u => u.email === 'dealer.pq@rentnride.com');
  const ntDealer = dealers.find(u => u.email === 'dealer.nt@rentnride.com');
  const hgDealer = dealers.find(u => u.email === 'dealer.hg@rentnride.com');

  if (!pqDealer || !ntDealer || !hgDealer) {
    throw new Error("Missing Dealers. Please seed users first.");
  }

  const parksData = [
    {
      name: 'Phú Quốc Station',
      location: 'Phú Quốc',
      dealer_id: pqDealer.id,
      image: 'https://statics.vinpearl.com/du-lich-phu-quoc-2-ngay-1-dem-1_1629272392.jpg'
    },
    {
      name: 'Nha Trang Station',
      location: 'Nha Trang',
      dealer_id: ntDealer.id,
      image: 'https://ik.imagekit.io/tvlk/blog/2022/11/dia-diem-du-lich-nha-trang-1.jpg'
    },
    {
      name: 'Hà Giang Station',
      location: 'Hà Giang',
      dealer_id: hgDealer.id,
      image: 'https://vcdn1-dulich.vnecdn.net/2021/01/15/ha-giang-1-1610680194.jpg'
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
          Dealer: { connect: { id: p.dealer_id } }
        }
      });
      createdParks.push(newPark);
    }
  }

  console.log(`✅ Seeded ${createdParks.length} Parks (Phu Quoc, Nha Trang, Ha Giang)`);
  return createdParks;
}
