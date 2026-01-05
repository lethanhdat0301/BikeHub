import { Module, Global } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

import { RentalService } from './rental.service';
import { RentalController } from './rental.controller';

@Global()
@Module({
  imports: [],
  controllers: [RentalController],
  providers: [RentalService, PrismaService, UserService, EmailService],
  exports: [RentalService],
})
export class RentalModule { }
