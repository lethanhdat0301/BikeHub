import { Injectable } from '@nestjs/common';
import { BookingRequest, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingRequestService {
  constructor(private prisma: PrismaService) { }

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
        Bike: {
          select: {
            id: true,
            model: true,
            price: true,
            transmission: true,
            image: true,
            dealer_id: true,
            Dealer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
        },
        Dealer: {
          select: {
            id: true,
            name: true,
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

    // Get current booking request to check status change
    const currentBooking = await this.prisma.bookingRequest.findUnique({
      where,
    });

    const updatedBooking = await this.prisma.bookingRequest.update({
      data,
      where,
      include: {
        User: true,
      },
    });

    // If status changed to APPROVED and all required fields are present, create rental
    if (
      currentBooking?.status !== 'APPROVED' &&
      updatedBooking.status === 'APPROVED' &&
      updatedBooking.bike_id &&
      updatedBooking.start_date &&
      updatedBooking.end_date &&
      updatedBooking.estimated_price
    ) {
      // console.log('==== Creating rental from booking request ====');
      // console.log('BookingRequest data:', {
      //   id: updatedBooking.id,
      //   name: updatedBooking.name,
      //   email: updatedBooking.email,
      //   contact_details: updatedBooking.contact_details,
      //   pickup_location: updatedBooking.pickup_location,
      //   user_id: updatedBooking.user_id,
      // });

      await this.prisma.rental.create({
        data: {
          user_id: updatedBooking.user_id,
          bike_id: updatedBooking.bike_id,
          booking_request_id: updatedBooking.id, // Link to original booking
          start_time: updatedBooking.start_date,
          end_time: updatedBooking.end_date,
          status: 'ONGOING',
          price: updatedBooking.estimated_price,
          // Transfer customer contact information from booking
          contact_name: updatedBooking.name,
          contact_email: updatedBooking.email,
          contact_phone: updatedBooking.contact_details,
          pickup_location: updatedBooking.pickup_location,
        },
      });

      // console.log('==== Rental created successfully ====');

      // Update bike status to rented
      await this.prisma.bike.update({
        where: { id: updatedBooking.bike_id },
        data: { status: 'rented' },
      });
    }

    return updatedBooking;
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
