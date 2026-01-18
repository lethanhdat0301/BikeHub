import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
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
        return this.dealerService.createDealerWithAccount(body);
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
