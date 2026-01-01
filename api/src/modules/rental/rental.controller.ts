import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
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

  // Public endpoint for creating rental from frontend
  @Post('/')
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

  @Get('/')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllRentals(): Promise<RentalModel[]> {
    return this.rentalService.findAll({});
  }

  // Public listing that returns dealer-scoped rentals when a dealer token is present,
  // admin gets all rentals, anonymous callers get an empty list.
  @Get('/list')
  @UseGuards(OptionalJwtAuthGuard)
  async listRentals(@CurrentUser() user: any): Promise<RentalModel[]> {
    if (user && user.role === ROLES_ENUM.DEALER) {
      return this.rentalService.findAll({ where: { Bike: { Park: { dealer_id: user.id } } }, orderBy: { created_at: 'desc' } });
    }

    if (user && user.role === ROLES_ENUM.ADMIN) {
      return this.rentalService.findAll({ orderBy: { created_at: 'desc' } });
    }

    return [];
  }

  @Get('rental/check')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getFirstUser(): Promise<RentalModel> {
    console.log("----- check")
    return this.rentalService.findFirst();
  }

  @Get('rental/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getRentalById(@Param('id') id: string): Promise<RentalModel> {
    console.log("----- check12")
    return this.rentalService.findOne({ id: Number(id) });
  }

  @Get('user/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getRentalsByUser(
    @Param('id') id: string,
  ): Promise<RentalModel[]> {
    return this.rentalService.findAll({
      where: { user_id: Number(id) },
      orderBy: { created_at: 'desc' }
    });
  }



  @Post('rental')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async createRental(
    @Body() createRentalDto: CreateRentalDto,
  ): Promise<RentalModel> {
    const { user_id, bike_id, ...rest } = createRentalDto;
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

  @Put('rental/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async updateRental(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ): Promise<RentalModel> {
    const { user_id, bike_id, ...rest } = updateRentalDto;
    return this.rentalService.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        ...(user_id ? { User: { connect: { id: user_id } } } : {}),
        ...(bike_id ? { Bike: { connect: { id: bike_id } } } : {}),
      },
    });
  }

  @Delete('rental/:id')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async deleteRental(@Param('id') id: string): Promise<RentalModel> {
    return this.rentalService.delete({ id: Number(id) });
  }
}
