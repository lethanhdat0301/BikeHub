import 'reflect-metadata';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import path from 'path';

import { GLOBAL_CONFIG } from './configs/global.config';
import { AppModule } from './modules/app/app.module';
import { API_PREFIX } from './shared/constants/global.constants';
import { SwaggerConfig } from './configs/config.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);

  const allowedOrigins = process.env.CORS_ALLOW_URL
    ? process.env.CORS_ALLOW_URL.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  app.use(cookieParser());

  // Serve local uploads directory in development (or when fallback is used)
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),);

  const swaggerConfig = GLOBAL_CONFIG.swagger;

  // Swagger Api
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'RentnRide')
      .setDescription(swaggerConfig.description || 'RentnRide API')
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  }

  // const PORT = process.env.API_PORT || GLOBAL_CONFIG.nest.port;
  // const PORT = process.env.API_PORT || 8080;
  // await app.listen(PORT);
  const PORT = process.env.PORT || process.env.API_PORT || 8080;

  // BẮT BUỘC: Thêm tham số '0.0.0.0' để Cloud Run có thể kết nối
  await app.listen(PORT, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
