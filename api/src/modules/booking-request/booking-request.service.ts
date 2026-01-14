import { Injectable } from '@nestjs/common';
import { BookingRequest, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingRequestService {
  constructor(private prisma: PrismaService) { }

  /**
   * Parse datetime string to Date object with proper error handling
   * Handles HTML datetime-local format (YYYY-MM-DDTHH:MM) and converts to ISO format
   */
  private parseDateTimeString(dateTimeString: string, fieldName: string): Date {
    console.log(`Parsing ${fieldName}:`, dateTimeString);

    let dateString = dateTimeString.trim();
    console.log(`Trimmed ${fieldName}:`, dateString);

    // Basic validation - check if it looks like a datetime string
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z)?$/)) {
      throw new Error(`Invalid ${fieldName} format. Expected YYYY-MM-DDTHH:MM, got: ${dateString}`);
    }

    // Handle datetime-local format (YYYY-MM-DDTHH:MM)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      dateString += ':00'; // Add seconds
      console.log(`Added seconds to ${fieldName}:`, dateString);
    }

    // Add timezone if missing (has seconds but no timezone)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
      dateString += '.000Z'; // Add milliseconds and UTC timezone
      console.log(`Added timezone to ${fieldName}:`, dateString);
    }

    // If it already has timezone but no milliseconds, add them
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
      dateString = dateString.replace('Z', '.000Z');
      console.log(`Added milliseconds to ${fieldName}:`, dateString);
    }

    console.log(`Final transformed ${fieldName}:`, dateString);

    // Try to parse the date
    const parsedDate = new Date(dateString);
    console.log(`Parsed ${fieldName} object:`, parsedDate);

    // Validate the date
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid ${fieldName} after processing: ${dateString}`);
    }

    // Additional validation - check if the date is reasonable (not in the past before 2020, not too far in future)
    const year = parsedDate.getFullYear();
    if (year < 2020 || year > 2050) {
      throw new Error(`Invalid ${fieldName} year: ${year}. Expected between 2020-2050`);
    }

    console.log(`Final processed ${fieldName}:`, parsedDate.toISOString());
    return parsedDate;
  }

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
                email: true,
                phone: true
              }
            }
          },
        },
        Dealer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
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

    try {
      console.log('=== BOOKING REQUEST SERVICE UPDATE START ===');
      console.log('Where clause:', JSON.stringify(where, null, 2));
      console.log('Original data:', JSON.stringify(data, null, 2));

      // Process date fields if they exist
      const processedData = { ...data };

      // Handle date fields - Frontend now sends ISO strings, simpler processing
      if (processedData.start_date && typeof processedData.start_date === 'string') {
        try {
          if (processedData.start_date.trim()) {
            console.log('Processing start_date (ISO string):', processedData.start_date);
            processedData.start_date = new Date(processedData.start_date);
            // Validate the date
            if (isNaN(processedData.start_date.getTime())) {
              throw new Error('Invalid start_date after parsing ISO string');
            }
            console.log('Processed start_date:', processedData.start_date.toISOString());
          } else {
            processedData.start_date = undefined;
            console.log('Empty start_date, setting to undefined');
          }
        } catch (error) {
          console.error('Error parsing start_date:', processedData.start_date, error);
          console.error('Error stack:', error.stack);
          throw new Error(`Invalid start_date format: ${processedData.start_date} - ${error.message}`);
        }
      }

      if (processedData.end_date && typeof processedData.end_date === 'string') {
        try {
          if (processedData.end_date.trim()) {
            console.log('Processing end_date (ISO string):', processedData.end_date);
            processedData.end_date = new Date(processedData.end_date);
            // Validate the date
            if (isNaN(processedData.end_date.getTime())) {
              throw new Error('Invalid end_date after parsing ISO string');
            }
            console.log('Processed end_date:', processedData.end_date.toISOString());
          } else {
            processedData.end_date = undefined;
            console.log('Empty end_date, setting to undefined');
          }
        } catch (error) {
          console.error('Error parsing end_date:', processedData.end_date, error);
          console.error('Error stack:', error.stack);
          throw new Error(`Invalid end_date format: ${processedData.end_date} - ${error.message}`);
        }
      }

      console.log('Processed data:', JSON.stringify(processedData, null, 2));

      // Get current booking request to check status change
      console.log('Finding current booking...');
      const currentBooking = await this.prisma.bookingRequest.findUnique({
        where,
      });
      console.log('Current booking found:', currentBooking ? 'Yes' : 'No');

      console.log('Updating booking in database...');
      const updatedBooking = await this.prisma.bookingRequest.update({
        data: processedData,
        where,
        include: {
          User: true,
        },
      });
      // console.log('Database update successful');

      // If status changed to APPROVED and all required fields are present, create rental
      if (
        currentBooking?.status !== 'APPROVED' &&
        updatedBooking.status === 'APPROVED' &&
        updatedBooking.bike_id &&
        updatedBooking.start_date &&
        updatedBooking.end_date &&
        updatedBooking.estimated_price
      ) {
        // console.log('Creating rental from approved booking...');
        await this.prisma.rental.create({
          data: {
            user_id: updatedBooking.user_id,
            bike_id: updatedBooking.bike_id,
            booking_request_id: updatedBooking.id,
            start_time: updatedBooking.start_date,
            end_time: updatedBooking.end_date,
            status: 'ongoing',
            price: updatedBooking.estimated_price,
            contact_name: updatedBooking.name,
            contact_email: updatedBooking.email,
            contact_phone: updatedBooking.contact_details,
            pickup_location: updatedBooking.pickup_location,
          },
        });
        // console.log('Rental created successfully');

        // Update bike status to rented
        await this.prisma.bike.update({
          where: { id: updatedBooking.bike_id },
          data: { status: 'rented' },
        });
        // console.log('Bike status updated to rented');
      }

      // console.log('=== BOOKING REQUEST SERVICE UPDATE SUCCESS ===');
      return updatedBooking;
    } catch (error) {
      console.error('=== BOOKING REQUEST SERVICE UPDATE ERROR ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
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
