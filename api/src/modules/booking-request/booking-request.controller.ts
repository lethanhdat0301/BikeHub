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
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags } from '@nestjs/swagger';
import { BookingRequest as BookingRequestModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { Roles } from '../auth/auth.roles.decorator';
import { ROLES_ENUM } from '../../shared/constants/global.constants';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { BookingRequestService } from './booking-request.service';
import { EmailService } from '../email/email.service';
import { buildBookingConfirmationHtml } from '../email/templates/booking-confirmation.template';
import { DealerService } from '../dealer/dealer.service';
import {
  CreateBookingRequestDto,
  UpdateBookingRequestDto,
} from './booking-request.dto';

@ApiTags('booking-requests')
@Controller('/booking-requests')
export class BookingRequestController {
  constructor(
    private bookingRequestService: BookingRequestService,
    private dealerService: DealerService,
    private emailService: EmailService,
  ) { }

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

    // Send confirmation email (non-blocking for the API response)
    try {
      if (bookingRequest.email) {
        const subject = `Booking request received: ${formattedBookingId}`;
        const text = `Hi ${bookingRequest.name},\n\n` +
          `Your booking request (${formattedBookingId}) has been received successfully.\n\n` +
          `Pickup location: ${bookingRequest.pickup_location}\n` +
          `Contact method: ${bookingRequest.contact_method}\n\n` +
          `We will contact you soon to confirm availability.\n\n` +
          `Thank you,\nRentNRide Team`;

        // Build HTML version — use the shared template to match the posted design
        const emailLogoUrl = process.env.EMAIL_LOGO_URL;
        let logoSrc = 'cid:logo';
        let inlineLogoPath: string | undefined = undefined;

        if (emailLogoUrl) {
          // Absolute URL -> use directly
          if (/^https?:\/\//i.test(emailLogoUrl)) {
            logoSrc = emailLogoUrl;
          } else {
            // Try resolving to a local file to attach inline (preferred to avoid mail-proxy rewriting)
            const candidates = [
              path.resolve(process.cwd(), emailLogoUrl),
              path.resolve(process.cwd(), 'frontend', emailLogoUrl),
              path.resolve(process.cwd(), '..', 'frontend', emailLogoUrl),
              path.resolve(__dirname, '..', '..', '..', emailLogoUrl),
            ];

            const found = candidates.find((p) => fs.existsSync(p));
            if (found) {
              logoSrc = 'cid:logo';
              inlineLogoPath = found;
              // Make the resolved path available for other email codepaths
              process.env.EMAIL_LOGO_PATH = found;
              console.log('Set EMAIL_LOGO_PATH for inline logo to:', found);
            } else {
              // Fallback to public URL assembled from BASE_URL_PROD
              const base = process.env.BASE_URL_PROD ? process.env.BASE_URL_PROD.replace(/\/$/, '') : '';
              logoSrc = base ? `${base}/${emailLogoUrl.replace(/^\//, '')}` : emailLogoUrl;
            }
          }
        }

        const baseUrl = process.env.BASE_URL_PROD ? process.env.BASE_URL_PROD : '/';
        const html = buildBookingConfirmationHtml({
          baseUrl: baseUrl,
          name: bookingRequest.name,
          bookingId: formattedBookingId,
          pickupLocation: bookingRequest.pickup_location,
          contactMethod: bookingRequest.contact_method,
          contactDetail: bookingRequest.contact_details || '',
          serverName: '',
          daysToDisconnect: 2,
          logoSrc,
        });

        await this.emailService.sendEmail(bookingRequest.email, subject, text, html, { inlineLogoPath });
      }
    } catch (e) {
      // Log and continue — do not fail booking creation if email sending fails
      console.error('Failed to send booking confirmation email:', e);
    }

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

  // Admin and Dealer - Get all booking requests
  @Get('/')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getAllBookingRequests(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ): Promise<BookingRequestModel[]> {
    let where: any = status ? { status } : {};

    // Dealers only see booking requests for their bikes
    if (user.role === ROLES_ENUM.DEALER) {
      // Find dealer record from user
      const dealer = await this.dealerService.findDealerByUserId(user.id);
      if (dealer) {
        where = {
          ...where,
          dealer_id: dealer.id,
        };
      } else {
        // If no dealer found, return empty array
        return [];
      }
    }

    return this.bookingRequestService.findAll({ where });
  }

  // Admin only - Get statistics
  @Get('/statistics')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getStatistics() {
    return this.bookingRequestService.getStatistics();
  }

  // Admin and Dealer - Get single booking request
  @Get('/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getBookingRequestById(
    @Param('id') id: string,
  ): Promise<BookingRequestModel> {
    return this.bookingRequestService.findOne({ id: Number(id) });
  }

  // Admin and Dealer - Update booking request (approve/reject/complete)
  @Put('/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async updateBookingRequest(
    @Param('id') id: string,
    @Body() updateBookingRequestDto: UpdateBookingRequestDto,
    @CurrentUser() user: any,
  ): Promise<BookingRequestModel> {
    console.log('Updating booking request:', id, updateBookingRequestDto);

    // For dealers, verify they own this booking
    if (user.role === ROLES_ENUM.DEALER) {
      const dealer = await this.dealerService.findDealerByUserId(user.id);
      if (dealer) {
        const booking = await this.bookingRequestService.findOne({ id: Number(id) });
        if (booking && booking.dealer_id !== dealer.id) {
          throw new Error('You can only update your own bookings');
        }
      }
    }

    return this.bookingRequestService.update({
      where: { id: Number(id) },
      data: updateBookingRequestDto,
    });
  }

  // New endpoint specifically for dealer actions (accept/reject)
  @Put('/:id/dealer-action')
  @Roles(ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async dealerAction(
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'reject'; notes?: string },
    @CurrentUser() user: any,
  ): Promise<BookingRequestModel> {
    const dealer = await this.dealerService.findDealerByUserId(user.id);
    if (!dealer) {
      throw new Error('Dealer not found');
    }

    const booking = await this.bookingRequestService.findOne({ id: Number(id) });
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.dealer_id !== dealer.id) {
      throw new Error('You can only update your own bookings');
    }

    const status = body.action === 'accept' ? 'CONFIRMED' : 'REJECTED';
    const admin_notes = body.notes || `${body.action === 'accept' ? 'Accepted' : 'Rejected'} by dealer ${dealer.name}`;

    return this.bookingRequestService.update({
      where: { id: Number(id) },
      data: { status, admin_notes },
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
