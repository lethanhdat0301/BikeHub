import { Module } from '@nestjs/common';
import { ReferrerController } from './referrer.controller';
import { ReferrerService } from './referrer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ReferrerController],
    providers: [ReferrerService],
    exports: [ReferrerService],
})
export class ReferrerModule { }
