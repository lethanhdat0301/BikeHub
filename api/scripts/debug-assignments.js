#!/usr/bin/env node

// Script để debug booking request assignments
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBookingAssignments() {
    try {
        console.log('🔍 Debugging booking request assignments...');

        const bookingRequests = await prisma.bookingRequest.findMany({
            include: {
                Bike: {
                    include: {
                        Dealer: true
                    }
                },
                Dealer: true
            }
        });

        console.log('\n📊 Booking Requests Summary:');
        console.log(`Total booking requests: ${bookingRequests.length}`);

        bookingRequests.forEach(br => {
            console.log(`\n📋 Booking ${br.id}:`);
            console.log(`  - Customer: ${br.name}`);
            console.log(`  - Bike ID: ${br.bike_id}`);
            console.log(`  - Bike Model: ${br.Bike?.model || 'N/A'}`);
            console.log(`  - Direct Dealer ID: ${br.dealer_id || 'None'}`);
            console.log(`  - Direct Dealer Name: ${br.Dealer?.name || 'None'}`);
            console.log(`  - Bike Dealer ID: ${br.Bike?.dealer_id || 'None'}`);
            console.log(`  - Bike Dealer Name: ${br.Bike?.Dealer?.name || 'None'}`);
            console.log(`  - Status: ${br.status}`);
        });

        console.log('\n🚲 Bike Assignments Summary:');
        const bikes = await prisma.bike.findMany({
            include: {
                Dealer: true
            }
        });

        bikes.forEach(bike => {
            console.log(`Bike ${bike.id} (${bike.model}): dealer_id=${bike.dealer_id}, dealer_name=${bike.Dealer?.name || bike.dealer_name || 'None'}`);
        });

        console.log('\n👥 Dealer Summary:');
        const dealers = await prisma.dealer.findMany();
        dealers.forEach(dealer => {
            console.log(`Dealer ${dealer.id}: ${dealer.name} (${dealer.email})`);
        });

        console.log('\n👤 User Summary:');
        const users = await prisma.user.findMany({
            where: { role: 'dealer' }
        });
        users.forEach(user => {
            console.log(`User ${user.id}: ${user.name} (${user.email}) - role: ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Error debugging:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
debugBookingAssignments();