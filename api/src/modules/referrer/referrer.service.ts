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
}
