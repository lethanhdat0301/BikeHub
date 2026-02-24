import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { DealerService } from './dealer.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('dealers')
@Controller('dealers')
export class DealerController {
    constructor(private readonly dealerService: DealerService) { }

    @Get()
    findAll() {
        return this.dealerService.findAll();
    }

    @Get('user/:userId')
    async findDealerByUserId(@Param('userId') userId: string) {
        return this.dealerService.findDealerByUserId(+userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.dealerService.findOne(+id);
    }

    @Post('create-account')
    async createDealerWithAccount(@Body() body: any) {
        // Tạo cả User và Dealer trong một endpoint
        try {
            return await this.dealerService.createDealerWithAccount(body);
        } catch (err: any) {
            // map known errors to HttpException
            if (err.message && err.message.includes('Email already')) {
                throw new BadRequestException(err.message);
            }
            // prisma missing park or other business logic
            if (err.message && err.message.includes('park_id is required')) {
                throw new BadRequestException(err.message);
            }
            if (err.message && err.message.includes('does not exist')) {
                throw new BadRequestException(err.message);
            }
            // fallback
            throw new InternalServerErrorException(err.message);
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() createDealerDto: any) {
        return this.dealerService.create(createDealerDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateDealerDto: any) {
        return this.dealerService.update(+id, updateDealerDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.dealerService.remove(+id);
    }
}
