import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgMembershipPort } from '../application/org-membership.port';
import { REQUIRE_SONG_ROLE_KEY } from './require-song-role.decorator';

/**
 * Guard: Verify user has the required role in the organization.
 *
 * Uses OrgMembershipPort (ACL) instead of importing Organization domain directly.
 * The required role is specified via @RequireSongRole('SONGWRITER') decorator.
 *
 * Requires: SessionGuard to run first (sets request.user)
 * Route param: :id (organization ID)
 * Decorator: @RequireSongRole(role)
 */
@Injectable()
export class SongRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly orgMembership: OrgMembershipPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const organizationId = request.params.id;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID not provided');
    }

    const requiredRole = this.reflector.get<string>(
      REQUIRE_SONG_ROLE_KEY,
      context.getHandler(),
    );

    // If no role required, just check membership
    if (!requiredRole) {
      const isMember = await this.orgMembership.isMember(
        organizationId,
        user.id,
      );

      if (!isMember) {
        throw new ForbiddenException(
          'User is not a member of this organization',
        );
      }

      return true;
    }

    const hasRole = await this.orgMembership.hasRole(
      organizationId,
      user.id,
      requiredRole,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `User must have role ${requiredRole} to perform this action`,
      );
    }

    return true;
  }
}
