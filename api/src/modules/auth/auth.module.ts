import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

import { JwtStrategy } from './auth.jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './auth.google.strategy';
import { EmailService } from '../email/email.service';

const authProviders: Provider[] = [UserService, AuthService, JwtStrategy, PrismaService, EmailService];
if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  authProviders.push(GoogleStrategy);
} else {
  // Don't register GoogleStrategy when OAuth credentials are not provided.
  // This prevents startup failures in local/dev environments.
  // To enable Google OAuth, set CLIENT_ID and CLIENT_SECRET in `api/.env`.
  // eslint-disable-next-line no-console
  console.warn('GoogleStrategy not registered: CLIENT_ID/CLIENT_SECRET not set');
}

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SIGNATURE!,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    PrismaModule,
  ],
  providers: authProviders,
  controllers: [AuthController],
})
export class AuthModule {}
