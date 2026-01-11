import { Injectable, BadRequestException } from '@nestjs/common';
import { Park, Bike, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { equal } from 'assert';
type BikeWithPark = Prisma.BikeGetPayload<{
  include: { Park: true };
}>;
@Injectable()
export class BikeService {
  constructor(private prisma: PrismaService) { }

  async findOne(
    bikeWhereUniqueInput: Prisma.BikeWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.bike.findUnique({
      where: bikeWhereUniqueInput,
      include: {
        Park: true,
        Dealer: true,
      } as any,
    } as any);
  }

  async findFirst(): Promise<Bike> {
    return this.prisma.bike.findFirst();
  }

  async findByStatus(status: string, limit?: number): Promise<Bike[]> {
    return this.prisma.bike.findMany({
      where: {
        status: {
          equals: status,
          mode: 'insensitive'
        }
      },
      take: limit ? Number(limit) : undefined,
      include: ({
        Park: true,
        Dealer: true,
      } as any),
      orderBy: {
        created_at: 'desc'
      }
    } as any);
  }

  async findByParkAndStatus(parkId: number, status?: string, limit?: number): Promise<Bike[]> {
    const whereClause: any = { park_id: parkId };
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.bike.findMany({
      where: whereClause,
      take: limit || undefined,
      include: ({
        Park: true,
        Dealer: true,
      } as any),
    } as any);
  }

  async findByDealer(dealerId: number) {
    return this.prisma.bike.findMany({
      where: ({
        dealer_id: dealerId,
      } as any),
      include: ({
        Park: true,
        Dealer: true,
      } as any),
    } as any);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BikeWhereUniqueInput;
    where?: Prisma.BikeWhereInput;
    orderBy?: Prisma.BikeOrderByWithRelationInput;
  }): Promise<Bike[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.bike.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        Park: true,
      },
    });
  }

  async create(data: Prisma.BikeCreateInput): Promise<Bike> {
    // Normalize & sanitize common fields coming from clients (strings from forms)
    const payload: any = { ...data } as any;

    // Ensure numeric fields are numbers
    if (payload.seats && typeof payload.seats === 'string') {
      const n = Number(payload.seats);
      payload.seats = Number.isNaN(n) ? undefined : n;
    }
    if (payload.price && typeof payload.price === 'string') {
      const n = Number(payload.price);
      payload.price = Number.isNaN(n) ? undefined : n;
    }

    // Provide sensible default for required status field
    if (!payload.status) {
      payload.status = 'available';
    }

    // Remove transient/UI-only fields
    if ((payload as any).image_preview) delete (payload as any).image_preview;

    return this.prisma.bike.create({
      data: payload,
    });
  }

  async update(params: {
    where: Prisma.BikeWhereUniqueInput;
    data: Prisma.BikeUpdateInput;
  }): Promise<Bike> {
    const { data, where } = params;

    // Make a defensive copy and sanitize nested relation payloads
    const payload: any = { ...(data as any) };

    // Normalize numeric fields if coming from strings
    if (payload.seats && typeof payload.seats === 'string') {
      const n = Number(payload.seats);
      payload.seats = Number.isNaN(n) ? undefined : n;
    }
    if (payload.price && typeof payload.price === 'string') {
      const n = Number(payload.price);
      payload.price = Number.isNaN(n) ? undefined : n;
    }

    // Sanitize Park if a raw object with id was passed
    if (payload.Park && typeof payload.Park === 'object') {
      if ((payload.Park as any).id) {
        payload.Park = { connect: { id: Number((payload.Park as any).id) } };
      }
      // otherwise, assume caller provided a valid nested op like connect/update
    }

    // If caller provided dealer_id (scalar) convert it to proper nested Prisma operation
    if (Object.prototype.hasOwnProperty.call(payload, 'dealer_id')) {
      const val = (payload as any).dealer_id;
      // remove scalar to avoid Prisma validation errors
      delete (payload as any).dealer_id;
      if (val === null) {
        // disconnect relation
        payload.Dealer = { disconnect: true };
      } else {
        const id = Number(val);
        if (!Number.isNaN(id)) payload.Dealer = { connect: { id } };
      }
    }

    // Sanitize Dealer payload to avoid passing a raw User object to Prisma
    if (payload.Dealer && typeof payload.Dealer === 'object') {
      const D: any = payload.Dealer;
      // If it's a raw user object with an `id` field (and other user fields), prefer connect by id
      const hasRawUserFields = Object.keys(D).some(k => ['name', 'email', 'password', 'role', 'birthdate', 'phone', 'image'].includes(k));
      if ((D as any).id && hasRawUserFields) {
        // convert to connect by id
        payload.Dealer = { connect: { id: Number((D as any).id) } };
      } else if ((D as any).id && !hasRawUserFields) {
        // if only id present, connect by id
        payload.Dealer = { connect: { id: Number((D as any).id) } };
      } else {
        // Allow standard nested Prisma operations (connect, create, update, connectOrCreate, upsert, disconnect, delete)
        const allowedOps = ['connect', 'create', 'update', 'connectOrCreate', 'upsert', 'disconnect', 'delete'];
        const hasAllowedOp = allowedOps.some(op => Object.prototype.hasOwnProperty.call(D, op));
        if (!hasAllowedOp) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Rejected raw Dealer payload in BikeService.update:', D);
          }
          throw new BadRequestException('Invalid Dealer payload. Use `dealer_id` (number) or nested Prisma operations like `Dealer: { connect: { id } }`.');
        }
      }
    }

    // Remove immutable/read-only fields if present in the payload (created_at, updated_at, id)
    ['created_at', 'updated_at', 'id', 'image_preview'].forEach((f) => delete (payload as any)[f]);

    // Also strip any nested arrays/relations that shouldn't be passed directly
    if ((payload as any).Rental) delete (payload as any).Rental;
    if ((payload as any).BookingRequest) delete (payload as any).BookingRequest;

    return this.prisma.bike.update({
      data: payload,
      where,
    });
  }

  async delete(where: Prisma.BikeWhereUniqueInput): Promise<Bike> {
    return this.prisma.bike.delete({
      where,
    });
  }
}
