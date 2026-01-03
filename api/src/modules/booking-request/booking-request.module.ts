import { Module } from '@nestjs/common';
import { BookingRequestController } from './booking-request.controller';
import { BookingRequestService } from './booking-request.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingRequestController],
  providers: [BookingRequestService],
  exports: [BookingRequestService],
})
export class BookingRequestModule {}
