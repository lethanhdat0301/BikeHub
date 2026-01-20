import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const dealers = await this.prisma.dealer.findMany({
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true,
                    }
                },
                Park: true,
            },
            orderBy: { created_at: 'desc' },
        });

        // Calculate stats for each dealer
        const dealersWithStats = await Promise.all(dealers.map(async (dealer) => {
            // Count bikes owned by this dealer
            const bikes = await this.prisma.bike.findMany({
                where: { dealer_id: dealer.user_id }
            });
            const bikeIds = bikes.map(b => b.id);

            // Count rentals for dealer's bikes
            const rentals = await this.prisma.rental.findMany({
                where: {
                    bike_id: { in: bikeIds }
                }
            });

            // Calculate total revenue from completed rentals
            const totalRevenue = rentals
                .filter(r => r.status === 'completed')
                .reduce((sum, r) => sum + (r.price || 0), 0);

            return {
                ...dealer,
                vehicles: bikes.length,
                total_rentals: rentals.length,
                total_revenue: totalRevenue,
                // platform_fee and current_debt already in DB
            };
        }));

        return dealersWithStats;
    }

    async findOne(id: number) {
        return this.prisma.dealer.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return this.prisma.dealer.create({
            data,
        });
    }

    async createDealerWithAccount(data: any) {
        // Validate park_id là bắt buộc
        if (!data.park_id) {
            throw new Error('park_id is required. Dealer must be assigned to a park.');
        }
        return this.prisma.$transaction(async (tx) => {
            // Verify park exists
            const park = await this.prisma.park.findUnique({
                where: { id: data.park_id }
            });

            if (!park) {
                throw new Error(`Park with id ${data.park_id} does not exist.`);
            }

            // Prisma middleware sẽ tự động hash password, không cần hash ở đây
            const user = await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: data.password, // Sẽ được hash bởi UserListener middleware
                    phone: data.phone,
                    role: 'dealer',
                    birthdate: new Date(),
                },
            });

            const dealer = await this.prisma.dealer.create({
                data: {
                    User: {
                        connect: { id: user.id }
                    },
                    Park: {
                        connect: { id: park.id }
                    },
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    telegram: data.telegram,
                    location: data.location,
                    status: 'Active',
                },
            });

            return { user, dealer };
        });
    }

    // New method to find dealer by user ID
    async findDealerByUserId(userId: number) {
        return this.prisma.dealer.findUnique({
            where: { user_id: userId },
            include: {
                Park: true
            }
        });
    }

    async update(id: number, data: any) {
        return this.prisma.dealer.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.dealer.delete({
            where: { id },
        });
    }
}
