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



  // ================= GET =================
  @Get('/')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllParks(@CurrentUser() user: any): Promise<ParkModel[]> {
    // Return all parks — both admins and dealers can view all parks, but dealers will still only be allowed to modify their own parks (enforced in update/delete)
    return this.parkService.findAll({});
  }

  @Get('park/check')
  @Roles(ROLES_ENUM.ADMIN, ROLES_ENUM.DEALER)
  @UseGuards(JwtAuthGuard)
  async getFirstPark(@CurrentUser() user: any): Promise<ParkModel> {
    // Return first park for anyone (dealer can view other parks as well)
    return this.parkService.findFirst();
  }

  @Get('park/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getParkById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    // Dealers can view any park by id; ownership checks are enforced only for update/delete
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

    // Dealers may view open parks across the system; do not restrict by dealer
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

    // Dealers may view closed parks across the system; do not restrict by dealer
    return this.parkService.findAll({ where });
  }

  // ================= CREATE =================
  @Post('park')
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async createPark(
    @Body() createParkDto: CreateParkDto,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    // Sanitize payload: parks are no longer owned by dealers — ignore any attempted dealer assignment
    const data: any = { ...createParkDto };
    delete data.dealer;
    delete data.dealer_id;
    delete data.Dealer;

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
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async updatePark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParkDto,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {
    // Sanitize incoming payload: parks are not owned by dealers — ignore any attempted dealer assignment
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
  @Roles(ROLES_ENUM.ADMIN)
  @UseGuards(JwtAuthGuard)
  async deletePark(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<ParkModel> {

    // Parks are not owned by dealers. Proceed to delete (admins only).
    return this.parkService.delete({ id });
  }
}
