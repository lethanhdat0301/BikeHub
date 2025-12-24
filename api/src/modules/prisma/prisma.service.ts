import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { UserListener } from '../user/user.listener';

import { PRISMA_LOG_CONFIG } from './prisma.config';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'error' | 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: PRISMA_LOG_CONFIG,
    });

    this.$on('error', (_e) => {
      // TODO: error msg
    });

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not loaded');
    }

    this.$use(UserListener.onCreated);
  }

  async onModuleInit() {
    console.log('DATABASE_URL =', process.env.DATABASE_URL);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
