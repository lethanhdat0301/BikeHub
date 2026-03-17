const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignDealersToDefaultPark() {
  console.log('🔄 Assigning existing dealers to default park...');

  try {
    // 1. Kiểm tra xem có park nào không
    const parks = await prisma.park.findMany();

    if (parks.length === 0) {
      console.log('❌ No parks found! Creating default park...');
      const defaultPark = await prisma.park.create({
        data: {
          name: 'Default Park',
          location: 'Default Location',
        },
      });
      console.log('✅ Created default park with ID: ' + defaultPark.id);
      parks.push(defaultPark);
    }

    // 2. Lấy park đầu tiên làm default
    const defaultParkId = parks[0].id;
    console.log('📍 Using park "' + parks[0].name + '" (ID: ' + defaultParkId + ') as default park');

    // 3. Kiểm tra các dealer chưa có park_id
    const dealersWithoutPark = await prisma.dealer.findMany({
      where: {
        park_id: null,
      },
    });

    console.log('Found ' + dealersWithoutPark.length + ' dealers without park assignment');

    // 4. Gắn tất cả dealer vào default park
    if (dealersWithoutPark.length > 0) {
      await prisma.dealer.updateMany({
        where: {
          park_id: null,
        },
        data: {
          park_id: defaultParkId,
        },
      });

      console.log('✅ Successfully assigned ' + dealersWithoutPark.length + ' dealers to park ID ' + defaultParkId);
    } else {
      console.log('✅ All dealers already have park assignments');
    }

    // 5. Verify kết quả
    const totalDealers = await prisma.dealer.count();
    const dealersWithPark = await prisma.dealer.count({
      where: {
        park_id: { not: null },
      },
    });

    console.log('\n📊 Summary:');
    console.log('   Total dealers: ' + totalDealers);
    console.log('   Dealers with park: ' + dealersWithPark);
    console.log('   Dealers without park: ' + (totalDealers - dealersWithPark));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    // 👇 Lỗi cũ nằm ở đây, giờ đã được sửa
    await prisma.$disconnect();
  }
}

assignDealersToDefaultPark()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
