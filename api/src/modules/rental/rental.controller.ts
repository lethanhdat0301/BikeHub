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

@ApiTags('rentals')
@Controller('/rentals')
export class RentalController {
  constructor(private rentalService: RentalService) { }

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
  ): Promise<RentalModel> {
    const { user_id, bike_id, start_date, end_date, price, referrer_phone, contact_name, contact_email, contact_phone, pickup_location } = body;

    // Create rental with pending status
    return this.rentalService.create({
      start_time: new Date(start_date),
      end_time: new Date(end_date),
      status: 'pending',
      price: price,
      qrcode: referrer_phone || '',
      contact_name: contact_name || '',
      contact_email: contact_email || '',
      contact_phone: contact_phone || '',
      pickup_location: pickup_location || '',
      ...(user_id ? { User: { connect: { id: user_id } } } : {}),
      Bike: { connect: { id: bike_id } },
    });
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
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getAllRentals(
    @CurrentUser() user: any,
  ): Promise<RentalModel[]> {
    if (user.role === ROLES_ENUM.DEALER) {
      // Dealers should see rentals for bikes they own
      return this.rentalService.findAll({
        where: ({ Bike: { dealer_id: user.id } } as any),
        orderBy: { created_at: 'desc' },
      } as any);
    }

    return this.rentalService.findAll({
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
    if (user?.role === ROLES_ENUM.DEALER) {
      return this.rentalService.findAll({
        where: ({ Bike: { dealer_id: user.id } } as any),
        orderBy: { created_at: 'desc' },
      } as any);
    }

    if (user?.role === ROLES_ENUM.ADMIN) {
      return this.rentalService.findAll({
        orderBy: { created_at: 'desc' },
      });
    }

    return [];
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

    const { user_id, bike_id, ...rest } = dto;

    if (
      user.role !== ROLES_ENUM.ADMIN &&
      user_id &&
      user_id !== user.id
    ) {
      throw new ForbiddenException('You cannot change rental owner');
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
    return this.rentalService.getBookingsWithDetails();
  }
}
