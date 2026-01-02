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
import { ReferrerService } from './referrer.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('referrers')
@Controller('referrers')
export class ReferrerController {
    constructor(private readonly referrerService: ReferrerService) { }

    @Get()
    findAll() {
        return this.referrerService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.referrerService.findOne(+id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() createReferrerDto: any) {
        return this.referrerService.create(createReferrerDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateReferrerDto: any) {
        return this.referrerService.update(+id, updateReferrerDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.referrerService.remove(+id);
    }
}
