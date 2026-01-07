import { Module } from '@nestjs/common';
import { BookingRequestController } from './booking-request.controller';
import { BookingRequestService } from './booking-request.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingRequestController],
  providers: [BookingRequestService, EmailService],
  exports: [BookingRequestService],
})
export class BookingRequestModule {}
