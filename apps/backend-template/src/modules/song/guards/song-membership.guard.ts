import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrgMembershipPort } from '../application/org-membership.port';

/**
 * Guard: Verify user is a member of the organization.
 *
 * Uses OrgMembershipPort (ACL) instead of importing Organization domain directly.
 *
 * Requires: SessionGuard to run first (sets request.user)
 * Route param: :id (organization ID)
 */
@Injectable()
export class SongMembershipGuard implements CanActivate {
  constructor(private readonly orgMembership: OrgMembershipPort) {}

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
}
