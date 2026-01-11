import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { Rental as RentalModel } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Roles } from '../auth/auth.roles.decorator';
import { ROLES_ENUM } from '../../shared/constants/global.constants';

import { RentalService } from './rental.service';
import { CreateRentalDto, UpdateRentalDto } from './rental.dto';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('rentals')
@Controller('/rentals')
export class RentalController {
  constructor(
    private rentalService: RentalService,
    private emailService: EmailService,
    private userService: UserService,
    private prisma: PrismaService,
  ) { }

  // ================= PUBLIC ENDPOINT =================
  // Public endpoint for creating rental from frontend
  @Post()
  async createRentalRequest(
    @Body() body: {
      user_id?: number;
      bike_id: number;
      start_date: string;
      end_date: string;
      price: number;
      referrer_phone?: string;
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
      pickup_location?: string;
      recaptcha_token: string;
    },
  ): Promise<any> {
    const { user_id, bike_id, start_date, end_date, price, referrer_phone, contact_name, contact_email, contact_phone, pickup_location } = body;

    // If guest booking (no user_id), check if user exists by email and create if not
    let finalUserId = user_id;
    if (!user_id && contact_email) {
      try {
        // Check if user exists with this email
        const existingUser = await this.userService.findUser({ email: contact_email });

        if (existingUser) {
          // User exists, use their ID
          finalUserId = existingUser.id;
        } else {
          // Create new user as customer
          const newUser = await this.userService.createUser({
            name: contact_name || 'Guest',
            email: contact_email,
            password: Math.random().toString(36).slice(-8), // Generate random password
            phone: contact_phone || '',
            birthdate: new Date(), // Default birthdate
            role: 'user',
            status: 'active',
          });
          finalUserId = newUser.id;
        }
      } catch (error) {
        console.error('Error creating/finding user:', error);
        // Continue without user_id if there's an error
      }
    }

    // Create rental with pending status
    const rental = await this.rentalService.create({
      start_time: new Date(start_date),
      end_time: new Date(end_date),
      status: 'pending',
      price: price,
      qrcode: referrer_phone || '',
      contact_name: contact_name || '',
      contact_email: contact_email || '',
      contact_phone: contact_phone || '',
      pickup_location: pickup_location || '',
      ...(finalUserId ? { User: { connect: { id: finalUserId } } } : {}),
      Bike: { connect: { id: bike_id } },
    });

    // Fetch complete rental details with bike and dealer info
    const rentalDetails: any = await this.rentalService.findOne({ id: rental.id });

    // Prepare booking details response with formatted booking ID
    const formattedBookingId = `BK${String(rental.id).padStart(6, '0')}`;
    const bookingDetails = {
      bookingId: formattedBookingId,
      bikeCode: rentalDetails?.Bike?.id || bike_id,
      bikeModel: rentalDetails?.Bike?.model || 'N/A',
      bookingDate: rental.start_time,
      startDate: rental.start_time,
      endDate: rental.end_time,
      dealerName: rentalDetails?.Bike?.Dealer?.name || rentalDetails?.Bike?.dealer_name || 'RentnRide',
      dealerPhone: rentalDetails?.Bike?.Dealer?.phone || rentalDetails?.Bike?.dealer_contact || 'Contact support',
      pickupLocation: pickup_location || rentalDetails?.Bike?.Park?.location || 'N/A',
      price: price,
      status: rental.status,
    };

    // Send confirmation email
    if (contact_email) {
      try {
        console.log('=== Attempting to send confirmation email to:', contact_email);
        const emailContent = `
Dear ${contact_name || 'Customer'},

Your bike rental booking has been confirmed!

Booking Details:
- Booking ID: ${formattedBookingId}
- Bike Model: ${bookingDetails.bikeModel}
- Bike Code: ${bookingDetails.bikeCode}
- Booking Date: ${new Date(bookingDetails.bookingDate).toLocaleDateString()}
- Rental Period: ${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()}
- Pickup Location: ${bookingDetails.pickupLocation}
- Total Price: $${price}
- Dealer: ${bookingDetails.dealerName}
- Dealer Contact: ${bookingDetails.dealerPhone}

Thank you for choosing RentnRide!

Best regards,
RentnRide Team
        `;

        await this.emailService.sendEmail(
          contact_email,
          'Booking Confirmation - RentnRide',
          emailContent,
        );
        console.log('=== Email sent successfully to:', contact_email);
      } catch (error) {
        console.error('=== Failed to send confirmation email:', error);
        // Don't fail the request if email fails
      }
    } else {
      console.log('=== No contact_email provided, skipping email notification');
    }

    console.log('=== Returning booking details:', bookingDetails);
    return bookingDetails;
  }

  // ================= HELPER =================
  private async checkDealerOwnRental(
    rentalId: number,
    user: any,
  ): Promise<RentalModel> {
    const rental = await this.rentalService.findOne({ id: rentalId });

    if (!rental) {
      throw new ForbiddenException('Rental not found');
    }

    if (
      user.role !== ROLES_ENUM.ADMIN &&
      rental.user_id !== user.id
    ) {
      throw new ForbiddenException('You do not own this rental');
    }

    return rental;
  }

  // ================= GET ALL =================
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllRentals(
    @CurrentUser() user: any,
  ): Promise<RentalModel[]> {
    // Admin sees all rentals
    if (user.role === ROLES_ENUM.ADMIN) {
      return this.rentalService.findAll({
        orderBy: { created_at: 'desc' },
      });
    }

    // Dealers see rentals for bikes they own
    if (user.role === ROLES_ENUM.DEALER) {
      return this.rentalService.findAll({
        where: ({ Bike: { dealer_id: user.id } } as any),
        orderBy: { created_at: 'desc' },
      } as any);
    }

    // Regular users see only their own rentals
    return this.rentalService.findAll({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });
  }

  @Get('rental/check')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getFirstRental(@CurrentUser() user: any): Promise<RentalModel> {
    if (user && user.role === ROLES_ENUM.DEALER) {
      const parks = await this.rentalService.findAll({ where: { user_id: user.id }, take: 1 });
      return parks[0];
    }
    // return this.rentalService.findFirst();
  }

  // ================= PUBLIC LIST =================
  @Get('/list')
  @UseGuards(OptionalJwtAuthGuard)
  async listRentals(
    @CurrentUser() user: any,
  ): Promise<RentalModel[]> {
    // Admin sees all rentals
    if (user?.role === ROLES_ENUM.ADMIN) {
      return this.rentalService.findAll({
        orderBy: { created_at: 'desc' },
      });
    }

    // Dealers see rentals for bikes they own
    if (user?.role === ROLES_ENUM.DEALER) {
      return this.rentalService.findAll({
        where: ({ Bike: { dealer_id: user.id } } as any),
        orderBy: { created_at: 'desc' },
      } as any);
    }

    // Regular users see only their own rentals
    if (user?.id) {
      return this.rentalService.findAll({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
      });
    }

    // Guest users (not logged in) - return empty array
    return [];
  }

  // ================= PUBLIC SEARCH =================
  // New endpoint for searching rentals by booking ID, phone, or email (public access)
  // MUST be before rental/:id to prevent route matching issues
  @Get('search/:query')
  async searchRentals(
    @Param('query') query: string,
  ): Promise<RentalModel[]> {
    // Search by booking ID (format: BK001234), phone, or email
    // First check if query is a booking ID format
    let bookingId: number | null = null;
    if (query.toUpperCase().startsWith('BK')) {
      const idStr = query.substring(2);
      bookingId = parseInt(idStr, 10);
    }

    // Search in multiple fields
    const rentals = await this.rentalService.findAll({
      where: {
        OR: [
          ...(bookingId ? [{ id: bookingId }] : []),
          { contact_phone: { contains: query } },
          { contact_email: { contains: query.toLowerCase() } },
          {
            User: {
              OR: [
                { phone: { contains: query } },
                { email: { contains: query.toLowerCase() } },
              ]
            }
          }
        ]
      },
      orderBy: { created_at: 'desc' },
    } as any);

    return rentals;
  }

  // ================= GET BY ID =================
  @Get('rental/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getRentalById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<RentalModel> {
    return this.checkDealerOwnRental(id, user);
  }

  // ================= GET BY USER =================
  @Get('user/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getRentalsByUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<RentalModel[]> {
    if (user.role === ROLES_ENUM.ADMIN) {
      return this.rentalService.findAll({
        where: { user_id: id },
        orderBy: { created_at: 'desc' },
      });
    }

    if (id !== user.id) {
      throw new ForbiddenException('You can only view your own rentals');
    }

    return this.rentalService.findAll({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });
  }

  // ================= CREATE =================
  @Post('rental')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async createRental(
    @Body() dto: CreateRentalDto,
    @CurrentUser() user: any,
  ): Promise<RentalModel> {
    const { user_id, bike_id, ...rest } = dto;

    if (
      user.role !== ROLES_ENUM.ADMIN &&
      user_id !== user.id
    ) {
      throw new ForbiddenException('You can only create rentals for yourself');
    }

    return this.rentalService.create({
      ...rest,
      User: {
        connect: { id: user_id },
      },
      Bike: {
        connect: { id: bike_id },
      },
    });
  }

  // ================= UPDATE =================
  @Put('rental/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async updateRental(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRentalDto,
    @CurrentUser() user: any,
  ): Promise<RentalModel> {
    await this.checkDealerOwnRental(id, user);

    const { user_id, bike_id, transfer_park_id, transfer_dealer_id, current_location, ...rest } = dto;

    if (
      user.role !== ROLES_ENUM.ADMIN &&
      user_id &&
      user_id !== user.id
    ) {
      throw new ForbiddenException('You cannot change rental owner');
    }

    // Handle transfer logic if provided
    let transferData = {};
    if (transfer_park_id && user.role === ROLES_ENUM.ADMIN) {
      // Transfer bike to new park (admin only)
      const currentRental = await this.rentalService.findOne({ id });
      if (currentRental?.bike_id) {
        await this.prisma.bike.update({
          where: { id: currentRental.bike_id },
          data: { park_id: transfer_park_id }
        });
        console.log(`Transferred bike ${currentRental.bike_id} to park ${transfer_park_id}`);
      }
    }

    if (transfer_dealer_id && user.role === ROLES_ENUM.ADMIN) {
      // Transfer bike to new dealer (admin only)
      const currentRental = await this.rentalService.findOne({ id });
      if (currentRental?.bike_id) {
        await this.prisma.bike.update({
          where: { id: currentRental.bike_id },
          data: { dealer_id: transfer_dealer_id }
        });
        console.log(`Transferred bike ${currentRental.bike_id} to dealer ${transfer_dealer_id}`);
      }
    }

    // Update bike location if current_location is provided
    if (current_location) {
      const currentRental = await this.rentalService.findOne({ id });
      if (currentRental?.bike_id) {
        await this.prisma.bike.update({
          where: { id: currentRental.bike_id },
          data: { location: current_location }
        });
        console.log(`Updated bike ${currentRental.bike_id} location to: ${current_location}`);
      }
    }

    return this.rentalService.update({
      where: { id },
      data: {
        ...rest,
        ...(user_id && { User: { connect: { id: user_id } } }),
        ...(bike_id && { Bike: { connect: { id: bike_id } } }),
      },
    });
  }

  // ================= DELETE =================
  @Delete('rental/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async deleteRental(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<RentalModel> {
    await this.checkDealerOwnRental(id, user);

    return this.rentalService.delete({ id });
  }

  @Get('bookings')
  async getBookings() {
    // This endpoint returns rentals (confirmed bookings), not booking requests
    return this.rentalService.getBookingsWithDetails();
  }

  // ================= RETURN BIKE =================
  @Put('rental/:id/return')
  async returnBike(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating?: number; review?: string },
  ): Promise<RentalModel> {
    return this.rentalService.returnBike(id, body.rating, body.review);
  }

  // ================= FIX MISSING CONTACT INFO =================
  @Post('fix-contact-info')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async fixMissingContactInfo(): Promise<any> {
    return this.rentalService.fixMissingContactInfo();
  }

}
