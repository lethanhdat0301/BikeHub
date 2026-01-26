#!/usr/bin/env node

// Script để fix dealer assignment issues
// Run this script để đồng bộ User và Dealer records

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDealerAssignments() {
    try {
        console.log('🔧 Starting dealer assignment fix...');

        // 1. Find all dealers
        const dealers = await prisma.dealer.findMany();
        console.log(`📊 Found ${dealers.length} dealers`);

        for (const dealer of dealers) {
            // Find corresponding user by email
            const user = await prisma.user.findUnique({
                where: { email: dealer.email }
            });

            if (user) {
                console.log(`✅ Found user for dealer ${dealer.name} (${dealer.email})`);
                
                // Find bikes assigned to this user
                const bikes = await prisma.bike.findMany({
                    where: { dealer_id: user.id }
                });

                console.log(`🚲 Found ${bikes.length} bikes for dealer ${dealer.name}`);

                // Find booking requests that should be assigned to this dealer
                const bookingRequests = await prisma.bookingRequest.findMany({
                    where: {
                        bike_id: { in: bikes.map(b => b.id) },
                        dealer_id: null // Only update unassigned bookings
                    }
                });

                if (bookingRequests.length > 0) {
                    console.log(`📋 Updating ${bookingRequests.length} booking requests for dealer ${dealer.name}`);
                    
                    // Update booking requests to assign correct dealer_id
                    await prisma.bookingRequest.updateMany({
                        where: {
                            id: { in: bookingRequests.map(br => br.id) }
                        },
                        data: {
                            dealer_id: dealer.id
                        }
                    });

                    console.log(`✅ Updated booking requests for dealer ${dealer.name}`);
                }
            } else {
                console.log(`❌ No user found for dealer ${dealer.name} (${dealer.email})`);
            }
        }

        console.log('🎉 Dealer assignment fix completed!');

        // Summary report
        const totalBookingRequests = await prisma.bookingRequest.count();
        const assignedBookingRequests = await prisma.bookingRequest.count({
            where: { dealer_id: { not: null } }
        });
        const unassignedBookingRequests = totalBookingRequests - assignedBookingRequests;

        console.log('\n📊 Summary:');
        console.log(`Total booking requests: ${totalBookingRequests}`);
        console.log(`Assigned to dealers: ${assignedBookingRequests}`);
        console.log(`Still unassigned: ${unassignedBookingRequests}`);

    } catch (error) {
        console.error('❌ Error fixing dealer assignments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
fixDealerAssignments();