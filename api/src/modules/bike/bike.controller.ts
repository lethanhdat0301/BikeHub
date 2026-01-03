import {
  Body,
  Controller,
  UseGuards,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Bike as BikeModel } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { Roles } from '../auth/auth.roles.decorator';
import { ROLES_ENUM } from '../../shared/constants/global.constants';

import { BikeService } from './bike.service';
import { ParkService } from '../park/park.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

type BikeWithPark = Prisma.BikeGetPayload<{
  include: { Park: true };
}>;

type BikeUpdateWithParkId = Prisma.BikeUpdateInput & {
  park_id?: number;
};
@ApiTags('bikes')
@Controller('/bikes')
export class BikeController {

  constructor(private bikeService: BikeService, private parkService: ParkService) { }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllBikes(@CurrentUser() user: any): Promise<BikeModel[]> {
    // Debugging: log current user and return counts in non-production for traceability
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('GET /bikes requested by user:', user ? { id: user.id, role: user.role } : null);
      } catch (e) {
        // ignore
      }
    }

    if (user && user.role === ROLES_ENUM.DEALER) {
      const bikes = await this.bikeService.findByDealer(user.id);
      if (process.env.NODE_ENV !== 'production') console.log('Returning bikes for dealer:', bikes.length);
      return bikes;
    }

    const all = await this.bikeService.findAll({});
    if (process.env.NODE_ENV !== 'production') console.log('Returning all bikes:', all.length);
    return all;
  }

  @Get('bike/check')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getFirstUser(): Promise<BikeModel> {
    return this.bikeService.findFirst();
  }

  @Get('park/:parkId?/:status?/:limit?')
  async getBikesByParkAndStatusWithLimit(
    @Param('parkId') parkId: string,
    @Param('status') status: string,
    @Param('limit') limit: string,
  ): Promise<BikeModel[]> {
    // console.log('parkId', parkId);
    // console.log('status', status);
    // console.log('limit', limit);
    return this.bikeService.findByParkAndStatus(Number(parkId), status, Number(limit));
  }

  @Get('status/:status/:limit?')
  async getBikesByStatus(
    @Param('status') status: string,
    @Param('limit') limit: string,
  ): Promise<BikeModel[]> {
    return this.bikeService.findByStatus(status, Number(limit));
  }

  @Get('bike/:id')
  async getBikeById(@Param('id') id: string): Promise<BikeModel> {
    return this.bikeService.findOne({ id: Number(id) });
  }

  @Post('bike')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async createBike(
    @Body()
    bikeData: {
      model: string;
      status?: string;
      lock?: boolean;
      location: string;
      price: number;
      park_id: number;
      dealer_id?: number; // optional when admin creates for another dealer
      image?: string;
      // Thông tin đánh giá
      rating?: number;
      review_count?: number;
      // Thông tin cung cấp
      dealer_name?: string;
      dealer_contact?: string;
      // Thông tin kỹ thuật
      seats?: number;
      fuel_type?: string;
      transmission?: string;
    },
    @CurrentUser() user: any,
  ): Promise<BikeModel> {
    const { model, status, lock, location, price, park_id, dealer_id, image,
      rating, review_count, dealer_name, dealer_contact,
      seats, fuel_type, transmission } = bikeData;

    if (!model) {
      throw new UnprocessableEntityException({ message: "Argument `model` is missing." });
    }
    if (!location) {
      throw new UnprocessableEntityException({ message: "Argument `location` is missing." });
    }
    if (price === undefined || price === null) {
      throw new UnprocessableEntityException({ message: "Argument `price` is missing." });
    }
    if (!park_id) {
      throw new UnprocessableEntityException({ message: "Argument `park_id` is missing." });
    }

    const data: any = {
      model,
      status,
      lock: Boolean(lock),
      location,
      price,
      image,
      rating,
      review_count,
      dealer_name,
      dealer_contact,
      seats,
      fuel_type,
      transmission,
      Park: {
        connect: { id: park_id },
      },
    };

    // If a dealer creates a bike, assign Dealer to them. Admin can set dealer_id explicitly.
    if (user && user.role === ROLES_ENUM.DEALER) {
      data.Dealer = { connect: { id: user.id } };
    } else if (dealer_id) {
      data.Dealer = { connect: { id: dealer_id } };
    }

    return this.bikeService.create(data);
  }

  @Put('bike/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async updateBike(
    @Param('id') id: string,
    @Body() bikeData: BikeUpdateWithParkId,
    @CurrentUser() user: any,
  ): Promise<BikeModel> {

    const bike = await this.bikeService.findOne({
      id: Number(id)
    });

    if (!bike) {
      throw new ForbiddenException('Bike not found');
    }

    // DEALER only allowed to edit bikes they own (bike.dealer_id)
    if (
      user.role !== ROLES_ENUM.ADMIN &&
      (bike as any).dealer_id !== user.id
    ) {
      throw new ForbiddenException('You do not own this bike');
    }
    const { id: _removed, park_id, ...rest } = bikeData as any;

    const updateData: Prisma.BikeUpdateInput = {
      ...rest,
      ...(park_id && {
        Park: {
          connect: { id: Number(park_id) },
        },
      }),
    };

    return this.bikeService.update({
      where: { id: Number(id) },
      data: updateData,
    });

  }



  @Delete('bike/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async deleteBike(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BikeModel> {

    const bike = await this.bikeService.findOne({
      id: Number(id),
    });

    if (!bike) {
      throw new ForbiddenException('Bike not found');
    }

    // DEALER only allowed to delete bikes they own
    if (
      user.role !== ROLES_ENUM.ADMIN &&
      (bike as any).dealer_id !== user.id
    ) {
      throw new ForbiddenException('You do not own this bike');
    }

    return this.bikeService.delete({
      id: Number(id),
    });
  }
}
