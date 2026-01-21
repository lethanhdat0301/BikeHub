import { PrismaClient, Park } from '@prisma/client';

export async function seedParks(prisma: PrismaClient) {
  // Parks will be assigned to dealers by admin later

  const parksData = [
    {
      name: 'Phu Quoc Island',
      location: 'Phu Quoc Island, Kien Giang Province',
      image: 'https://picsum.photos/800/600?random=1'
    },
    {
      name: 'Nha Trang Central',
      location: 'Nha Trang City, Khanh Hoa Province',
      image: 'https://picsum.photos/800/600?random=2'
    },
    {
      name: 'Ha Giang Loop',
      location: 'Ha Giang City, Ha Giang Province',
      image: 'https://picsum.photos/800/600?random=3'
    },
    {
      name: 'Ho Chi Minh City',
      location: 'District 1, Ho Chi Minh City',
      image: 'https://picsum.photos/800/600?random=4'
    },
    {
      name: 'Da Nang Coastal',
      location: 'Da Nang City, Central Vietnam',
      image: 'https://picsum.photos/800/600?random=5'
    },
    {
      name: 'Ha Noi City',
      location: 'Hoan Kiem District, Hanoi City',
      image: 'https://picsum.photos/800/600?random=6'
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
