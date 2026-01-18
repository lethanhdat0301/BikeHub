import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            where: { role: 'dealer' },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return this.prisma.user.create({
            data: {
                ...data,
                role: 'dealer',
            },
        });
    }

    async createDealerWithAccount(data: any) {
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: 'dealer',
                birthdate: new Date(),
            },
        });

        return user;
    }

    async update(id: number, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async findDealerByUserId(userId: number) {
        return this.prisma.user.findFirst({
            where: {
                id: userId,
                role: 'dealer',
            },
        });
    }
}
