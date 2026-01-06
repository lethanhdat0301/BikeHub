import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingRequest as BookingRequestModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { Roles } from '../auth/auth.roles.decorator';
import { ROLES_ENUM } from '../../shared/constants/global.constants';
import { BookingRequestService } from './booking-request.service';
import {
  CreateBookingRequestDto,
  UpdateBookingRequestDto,
} from './booking-request.dto';

@ApiTags('booking-requests')
@Controller('/booking-requests')
export class BookingRequestController {
  constructor(private bookingRequestService: BookingRequestService) { }

  // Public endpoint - Anyone can create a booking request
  @Post('/')
  async createBookingRequest(
    @Body() createBookingRequestDto: CreateBookingRequestDto,
  ): Promise<any> {
    const { user_id, ...rest } = createBookingRequestDto;

    let bookingRequest;
    if (user_id) {
      bookingRequest = await this.bookingRequestService.create({
        ...rest,
        User: {
          connect: { id: user_id },
        },
      });
    } else {
      bookingRequest = await this.bookingRequestService.create(rest);
    }

    // Return formatted response with Booking ID for customer display
    const formattedBookingId = `BK${String(bookingRequest.id).padStart(6, '0')}`;
    return {
      ...bookingRequest,
      bookingId: formattedBookingId,
      message: 'Booking request submitted successfully',
    };
  }

  // ================= PUBLIC SEARCH =================
  // Public endpoint for searching booking requests by booking ID, phone, or email
  @Get('search/:query')
  async searchBookingRequests(
    @Param('query') query: string,
  ): Promise<BookingRequestModel[]> {
    // Search by booking ID (format: BK001234), phone, or email
    let bookingId: number | null = null;
    if (query.toUpperCase().startsWith('BK')) {
      const idStr = query.substring(2);
      bookingId = parseInt(idStr, 10);
    }

    // Search in multiple fields
    const where: any = {
      OR: [
        ...(bookingId ? [{ id: bookingId }] : []),
        { contact_details: { contains: query } },
        { email: { contains: query.toLowerCase() } },
      ]
    };

    return this.bookingRequestService.findAll({ where });
  }

  // Admin only - Get all booking requests
  @Get('/')
  @Roles(ROLES_ENUM.ADMIN)
  // @UseGuards(JwtAuthGuard)
  async getAllBookingRequests(
    @Query('status') status?: string,
  ): Promise<BookingRequestModel[]> {
    const where = status ? { status } : {};
    return this.bookingRequestService.findAll({ where });
  }

  // Admin only - Get statistics
  @Get('/statistics')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    return this.bookingRequestService.getStatistics();
  }

  // Admin only - Get single booking request
  @Get('/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getBookingRequestById(
    @Param('id') id: string,
  ): Promise<BookingRequestModel> {
    return this.bookingRequestService.findOne({ id: Number(id) });
  }

  // Admin only - Update booking request (approve/reject/complete)
  @Put('/:id')
  @Roles(ROLES_ENUM.ADMIN)
  // @UseGuards(JwtAuthGuard)
  async updateBookingRequest(
    @Param('id') id: string,
    @Body() updateBookingRequestDto: UpdateBookingRequestDto,
  ): Promise<BookingRequestModel> {
    console.log('Updating booking request:', id, updateBookingRequestDto);
    return this.bookingRequestService.update({
      where: { id: Number(id) },
      data: updateBookingRequestDto,
    });
  }

  // Admin only - Delete booking request
  @Delete('/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async deleteBookingRequest(
    @Param('id') id: string,
  ): Promise<BookingRequestModel> {
    return this.bookingRequestService.delete({ id: Number(id) });
  }
}
