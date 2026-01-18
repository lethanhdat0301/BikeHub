import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import multer from 'multer';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const result = await this.uploadsService.uploadImage(file);
    return result;
  }

  @Get('image/:name')
  async getImageUrl(@Param('name') name: string) {
    // returns a public url for the image
    const url = await this.uploadsService.getFileUrl(name);
    return { url };
  }
}
