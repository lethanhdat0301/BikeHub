import { Injectable } from '@nestjs/common';
import { BookingRequest, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingRequestService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    bookingRequestWhereUniqueInput: Prisma.BookingRequestWhereUniqueInput,
  ): Promise<BookingRequest | null> {
    return this.prisma.bookingRequest.findUnique({
      where: bookingRequestWhereUniqueInput,
      include: {
        User: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookingRequestWhereUniqueInput;
    where?: Prisma.BookingRequestWhereInput;
    orderBy?: Prisma.BookingRequestOrderByWithRelationInput;
  }): Promise<BookingRequest[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.bookingRequest.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: orderBy || { created_at: 'desc' },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.BookingRequestCreateInput): Promise<BookingRequest> {
    return this.prisma.bookingRequest.create({
      data,
      include: {
        User: true,
      },
    });
  }

  async update(params: {
    where: Prisma.BookingRequestWhereUniqueInput;
    data: Prisma.BookingRequestUpdateInput;
  }): Promise<BookingRequest> {
    const { data, where } = params;
    return this.prisma.bookingRequest.update({
      data,
      where,
      include: {
        User: true,
      },
    });
  }

  async delete(where: Prisma.BookingRequestWhereUniqueInput): Promise<BookingRequest> {
    return this.prisma.bookingRequest.delete({
      where,
    });
  }

  async getStatistics() {
    const total = await this.prisma.bookingRequest.count();
    const pending = await this.prisma.bookingRequest.count({
      where: { status: 'PENDING' },
    });
    const approved = await this.prisma.bookingRequest.count({
      where: { status: 'APPROVED' },
    });
    const rejected = await this.prisma.bookingRequest.count({
      where: { status: 'REJECTED' },
    });
    const completed = await this.prisma.bookingRequest.count({
      where: { status: 'COMPLETED' },
    });

    return {
      total,
      pending,
      approved,
      rejected,
      completed,
    };
  }
}
