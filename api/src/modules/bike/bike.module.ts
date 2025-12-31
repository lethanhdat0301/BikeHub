import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { BikeService } from './bike.service';
import { ParkService } from '../park/park.service';

import { BikeController } from './bike.controller';

@Module({
  imports: [],
  controllers: [BikeController],
  providers: [BikeService, PrismaService, ParkService],
  exports: [BikeService],
})
export class BikeModule {}
