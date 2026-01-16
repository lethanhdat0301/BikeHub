import { Injectable } from '@nestjs/common';
import { Bike, Park, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParkService {
  constructor(private prisma: PrismaService) { }

  async findOne(
    where: Prisma.ParkWhereUniqueInput,
  ): Promise<Park | null> {
    return this.prisma.park.findUnique({
      where,
      include: {
        Bikes: true,
      },
    });
  }

  async findFirst(): Promise<Park> {
    return this.prisma.park.findFirst();
  }

  async findOpenParks(): Promise<Park[]> {
    return this.prisma.park.findMany({
      where: {
        Bikes: {
          some: {
            status: 'available',
          },
        },
      }
    });
  }

  async findClosedParks(): Promise<Park[]> {
    return this.prisma.park.findMany({
      where: {
        OR: [
          {
            Bikes: {
              none: {},
            },
          },
          {
            Bikes: {
              none: {
                status: 'available',
              },
            },
          },
        ],
      }
    });
  }
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ParkWhereUniqueInput;
    where?: Prisma.ParkWhereInput;
    orderBy?: Prisma.ParkOrderByWithRelationInput;
  }): Promise<Park[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.park.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        Bikes: true,
      },
    });
  }

  async create(data: Prisma.ParkCreateInput): Promise<Park> {
    const safeData: any = { ...(data as any) };
    if (safeData.dealer) delete safeData.dealer;
    if ('dealer_id' in safeData) delete safeData.dealer_id;
    return this.prisma.park.create({
      data: safeData,
    });
  }

  async update(params: {
    where: Prisma.ParkWhereUniqueInput;
    data: Prisma.ParkUpdateInput;
  }): Promise<Park> {
    const { where, data } = params;
    const safeData: any = { ...(data as any) };
    if (safeData.dealer) delete safeData.dealer;
    if ('dealer_id' in safeData) delete safeData.dealer_id;
    return this.prisma.park.update({ where, data: safeData });
  }

  async delete(where: Prisma.ParkWhereUniqueInput): Promise<Park> {
    return this.prisma.park.delete({ where });
  }
}
