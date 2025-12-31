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
    if (user.role === ROLES_ENUM.DEALER) {
      return this.bikeService.findByDealer(user.id);
    }
    return this.bikeService.findAll({});
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
      image?: string;
    },
  ): Promise<BikeModel> {
    const { model, status, lock, location, price, park_id, image } = bikeData;

    // Basic server-side validation with descriptive messages
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

    return this.bikeService.create({
      model,
      status,
      lock: Boolean(lock),
      location,
      price,
      image,
      Park: {
        connect: { id: park_id },
      },
    });
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
    const park = await this.parkService.findOne({
      id: Number(bike.Park.id)
    });

    if (!bike) {
      throw new ForbiddenException('Bike not found');
    }

    // DEALER chỉ được sửa bike trong park của mình
    if (
      user.role !== ROLES_ENUM.ADMIN &&
      park.dealer_id !== user.id
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

    const park = await this.parkService.findOne({
      id: Number(bike.Park.id),
    });

    // DEALER chỉ được xóa bike trong park của mình
    if (
      user.role !== ROLES_ENUM.ADMIN &&
      park.dealer_id !== user.id
    ) {
      throw new ForbiddenException('You do not own this bike');
    }

    return this.bikeService.delete({
      id: Number(id),
    });
  }
}
