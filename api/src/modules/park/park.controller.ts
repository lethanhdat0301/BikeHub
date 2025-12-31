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
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Park as ParkModel } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { Roles } from '../auth/auth.roles.decorator';
import { ROLES_ENUM } from '../../shared/constants/global.constants';

import { ParkService } from './park.service';
import { CreateParkDto, UpdateParkDto } from './park.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@ApiTags('parks')
@Controller('/parks')
export class ParkController {
  constructor(private parkService: ParkService) { }

  // ================= HELPER =================
  private async checkDealerOwnPark(
    parkId: number,
    user: any,
  ): Promise<ParkModel> {
    const park = await this.parkService.findOne({ id: parkId });

    if (!park) {
      throw new ForbiddenException('Park not found');
    }

    // DEALER chỉ được thao tác park của mình
    if (
      user.role !== ROLES_ENUM.ADMIN &&
      park.dealer_id !== user.id
    ) {
      throw new ForbiddenException('You do not own this park');
    }

    return park;
  }

  // ================= GET =================
  @Get('/')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllParks(@CurrentUser() user: any): Promise<ParkModel[]> {
    // Nếu là dealer thì chỉ trả về parks của dealer đó
    if (user && user.role === ROLES_ENUM.DEALER) {
      return this.parkService.findAll({ where: { dealer_id: user.id } });
    }

    return this.parkService.findAll({});
  }

  @Get('park/check')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getFirstPark(@CurrentUser() user: any): Promise<ParkModel> {
    // Nếu là dealer thì lấy park đầu tiên của dealer
    if (user && user.role === ROLES_ENUM.DEALER) {
      const parks = await this.parkService.findAll({ where: { dealer_id: user.id }, take: 1 });
      return parks[0];
    }

    return this.parkService.findFirst();
  }

  @Get('park/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getParkById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    // Nếu là dealer thì kiểm tra quyền sở hữu
    if (user && user.role === ROLES_ENUM.DEALER) {
      return await this.checkDealerOwnPark(id, user);
    }

    return this.parkService.findOne({ id });
  }

  @Get('/open')
  @UseGuards(OptionalJwtAuthGuard)
  async getOpenParks(@CurrentUser() user: any): Promise<ParkModel[]> {
    const where: any = {
      Bike: {
        some: {
          status: 'available',
        },
      },
    };

    if (user && user.role === ROLES_ENUM.DEALER) {
      where.dealer_id = user.id;
    }

    return this.parkService.findAll({ where });
  }

  @Get('/closed')
  @UseGuards(OptionalJwtAuthGuard)
  async getClosedParks(@CurrentUser() user: any): Promise<ParkModel[]> {
    const where: any = {
      OR: [
        {
          Bike: {
            none: {},
          },
        },
        {
          Bike: {
            none: {
              status: 'available',
            },
          },
        },
      ],
    };

    if (user && user.role === ROLES_ENUM.DEALER) {
      where.dealer_id = user.id;
    }

    return this.parkService.findAll({ where });
  }

  // ================= CREATE =================
  @Post('park')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async createPark(
    @Body() createParkDto: CreateParkDto,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    // Server-controlled: always assign the current authenticated user as the Dealer
    const data: any = { ...createParkDto };
    // Remove any attempted dealer assignment from client
    delete data.dealer;
    delete data.dealer_id;
    delete data.Dealer;

    // Assign Dealer relation to the current authenticated user (must exist)
    if (user) {
      data.Dealer = { connect: { id: user.id } };
    }

    try {
      return await this.parkService.create(data);
    } catch (err: any) {
      console.error('createPark error:', err);

      // Prisma errors often have a `code` and `meta` — expose useful info to client
      if (err && err.code) {
        // e.g. P2002 unique constraint, etc.
        throw new UnprocessableEntityException({
          message: err.message || 'Database error',
          code: err.code,
          meta: err.meta || undefined,
        });
      }

      // Already an HttpException (e.g., validation pipe) — rethrow so Nest keeps original status & body
      if (err && err.getStatus && err.getResponse) {
        throw err;
      }

      // Fallback: include message so frontend can display something useful
      throw new InternalServerErrorException({
        message: err && err.message ? err.message : 'Create park failed',
      });
    }
  }


  // ================= UPDATE =================
  @Put('park/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async updatePark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParkDto,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    await this.checkDealerOwnPark(id, user);

    // Sanitize incoming payload: do not allow clients to change the dealer
    const dataToUpdate: any = { ...dto };
    delete dataToUpdate.dealer;
    delete dataToUpdate.dealer_id;
    delete dataToUpdate.Dealer;

    return this.parkService.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // ================= DELETE =================
  @Delete('park/:id')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async deletePark(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {

    await this.checkDealerOwnPark(id, user);

    return this.parkService.delete({ id });
  }
}
