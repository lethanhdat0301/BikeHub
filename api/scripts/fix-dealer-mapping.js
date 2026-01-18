const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDealerMapping() {
  console.log('🔧 Fixing dealer mapping between User and Dealer tables...\n');

  try {
    // 1. Get all users with dealer role
    const dealerUsers = await prisma.user.findMany({
      where: { role: 'dealer' },
      select: { id: true, name: true, email: true }
    });

    console.log('👥 Dealer Users found:', dealerUsers.length);
    dealerUsers.forEach(user => {
      console.log(`  - User ${user.id}: ${user.name} (${user.email})`);
    });

    // 2. Get all dealers
    const dealers = await prisma.dealer.findMany({
      select: { id: true, name: true, email: true }
    });

    console.log('\n🏢 Dealer Records found:', dealers.length);
    dealers.forEach(dealer => {
      console.log(`  - Dealer ${dealer.id}: ${dealer.name} (${dealer.email})`);
    });

    // 3. Check booking requests with dealer_id pointing to non-existent dealers
    const problematicBookings = await prisma.bookingRequest.findMany({
      where: {
        dealer_id: {
          not: null
        }
      },
      include: {
        Dealer: true
      }
    });

    console.log('\n📋 Booking Requests with dealer assignments:', problematicBookings.length);
    
    const needsFixing = [];
    for (const booking of problematicBookings) {
      if (!booking.Dealer) {
        // Find matching dealer user
        const matchingUser = dealerUsers.find(user => user.id === booking.dealer_id);
        console.log(`  ⚠️  Booking ${booking.id}: dealer_id=${booking.dealer_id}, No Dealer record, User: ${matchingUser?.name || 'Not found'}`);
        needsFixing.push({ booking, matchingUser });
      } else {
        console.log(`  ✅ Booking ${booking.id}: dealer_id=${booking.dealer_id}, Dealer: ${booking.Dealer.name}`);
      }
    }

    // 4. Create missing dealer records for dealer users
    if (needsFixing.length > 0) {
      console.log('\n🔨 Creating missing dealer records...');
      
      // Group by user to avoid duplicates
      const uniqueUsers = [...new Set(needsFixing.map(item => item.matchingUser?.id))].filter(Boolean);
      
      for (const userId of uniqueUsers) {
        const user = dealerUsers.find(u => u.id === userId);
        if (user) {
          try {
            // Check if dealer with this email already exists
            const existingDealer = await prisma.dealer.findUnique({
              where: { email: user.email }
            });

            if (!existingDealer) {
              const newDealer = await prisma.dealer.create({
                data: {
                  name: user.name,
                  email: user.email,
                  status: 'Active'
                }
              });
              console.log(`  ✅ Created Dealer ${newDealer.id}: ${newDealer.name} for User ${user.id}`);

              // Update all booking requests pointing to this user to point to new dealer
              const updated = await prisma.bookingRequest.updateMany({
                where: { dealer_id: user.id },
                data: { dealer_id: newDealer.id }
              });
              console.log(`    📝 Updated ${updated.count} booking requests to use dealer ${newDealer.id}`);
            } else {
              console.log(`  ⚠️  Dealer with email ${user.email} already exists (ID: ${existingDealer.id})`);
              
              // Update booking requests to point to existing dealer
              const updated = await prisma.bookingRequest.updateMany({
                where: { dealer_id: user.id },
                data: { dealer_id: existingDealer.id }
              });
              console.log(`    📝 Updated ${updated.count} booking requests to use existing dealer ${existingDealer.id}`);
            }
          } catch (error) {
            console.error(`  ❌ Error creating dealer for user ${user.id}:`, error.message);
          }
        }
      }
    }

    // 5. Final verification
    console.log('\n🔍 Final verification...');
    const finalCheck = await prisma.bookingRequest.findMany({
      where: {
        dealer_id: { not: null }
      },
      include: {
        Dealer: true
      }
    });

    let fixedCount = 0;
    let stillBrokenCount = 0;

    for (const booking of finalCheck) {
      if (booking.Dealer) {
        console.log(`  ✅ Booking ${booking.id}: ${booking.Dealer.name}`);
        fixedCount++;
      } else {
        console.log(`  ❌ Booking ${booking.id}: Still no dealer found`);
        stillBrokenCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  ✅ Fixed bookings: ${fixedCount}`);
    console.log(`  ❌ Still broken: ${stillBrokenCount}`);
    console.log(`  📋 Total bookings with dealers: ${finalCheck.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDealerMapping();