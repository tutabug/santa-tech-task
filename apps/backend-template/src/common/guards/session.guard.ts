import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Auth, BETTER_AUTH } from '../../modules/auth/auth.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(BETTER_AUTH) private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = await this.auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const user = session.user;
    
    // Validate user structure to ensure controllers receive valid data
    if (
      !user ||
      typeof user !== 'object' ||
      !('id' in user) ||
      typeof user.id !== 'string'
    ) {
      throw new UnauthorizedException('Invalid user session');
    }

    request['user'] = user;
    request['session'] = session.session;
    return true;
  }
}
