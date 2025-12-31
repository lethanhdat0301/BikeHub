import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard: if an Authorization header is present and valid it
 * attaches `request.user`, otherwise it allows the request through anonymously.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    // If no auth header present, skip authentication
    if (!authHeader) {
      return true;
    }

    // Otherwise, try normal JWT auth and allow failure to result in anonymous
    try {
      return await super.canActivate(context) as boolean;
    } catch (e) {
      // swallow errors and allow anonymous access
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    // If token was invalid or missing, don't throw — return undefined to indicate anonymous
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
