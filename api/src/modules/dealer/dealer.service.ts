import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.dealer.findMany({
            orderBy: { created_at: 'desc' },
        });
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
                name: data.name,
                email: data.email,
                phone: data.phone,
                telegram: data.telegram,
                location: data.location,
                status: 'Active',
            },
        });

        return { user, dealer };
    }

    // New method to find dealer by user ID
    async findDealerByUserId(userId: number) {
        // Find dealer by matching email with user email
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return null;

        return this.prisma.dealer.findUnique({
            where: { email: user.email }
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
