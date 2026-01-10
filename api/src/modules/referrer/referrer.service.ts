import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferrerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.referrer.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.referrer.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return this.prisma.referrer.create({
            data,
        });
    }

    async update(id: number, data: any) {
        return this.prisma.referrer.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.referrer.delete({
            where: { id },
        });
    }

    async getReferralHistory(id: number) {
        // Get referrer info
        const referrer = await this.prisma.referrer.findUnique({
            where: { id },
        });

        if (!referrer) {
            throw new Error('Referrer not found');
        }

        // Find rentals where qrcode matches referrer phone (referrer_phone is stored in qrcode field)
        const referralRentals = await this.prisma.rental.findMany({
            where: {
                qrcode: referrer.phone || '',
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                Bike: {
                    select: {
                        id: true,
                        model: true,
                        dealer_name: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        // Calculate totals
        const totalReferrals = referralRentals.length;
        const totalEarnings = referralRentals.reduce((sum, rental) => sum + rental.price, 0);
        const estimatedCommission = totalEarnings * 0.1; // Assuming 10% commission

        return {
            referrer,
            totalReferrals,
            totalEarnings,
            estimatedCommission,
            referralHistory: referralRentals.map(rental => ({
                id: rental.id,
                bookingId: `BK${String(rental.booking_request_id || rental.id).padStart(6, '0')}`,
                customerName: rental.User ? rental.User.name : rental.contact_name || 'Guest',
                customerEmail: rental.User ? rental.User.email : rental.contact_email,
                customerPhone: rental.User ? rental.User.phone : rental.contact_phone,
                bikeModel: rental.Bike?.model || 'N/A',
                bikeId: rental.Bike?.id || rental.bike_id,
                rentalPrice: rental.price,
                estimatedCommission: rental.price * 0.1,
                startDate: rental.start_time,
                endDate: rental.end_time,
                status: rental.status,
                createdAt: rental.created_at,
            })),
        };
    }
}
