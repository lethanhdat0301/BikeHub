import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAvailableGuard implements CanActivate {
  private enabled = Boolean(process.env.CLIENT_ID && process.env.CLIENT_SECRET);

  async canActivate(context: ExecutionContext) {
    if (!this.enabled) {
      throw new NotFoundException('Google OAuth not configured on this server');
    }

    // Delegate to the Passport Google guard when enabled
    const Guard = AuthGuard('google') as unknown as any;
    const guard = new Guard();
    // If the guard returns a boolean or a Promise, return it directly
    return guard.canActivate(context);
  }
}
