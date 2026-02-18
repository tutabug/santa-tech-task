import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrganizationMemberRepository } from '../domain';

/**
 * Guard: Verify user is a member of the organization
 *
 * Checks if the user making the request is a member of the organization
 * specified in the route parameter :id (orgId).
 *
 * Usage: @UseGuards(SessionGuard, OrganizationMembershipGuard)
 * Requires: SessionGuard to run first (sets request.user)
 * Route param: :id (organization ID)
 */
@Injectable()
export class OrganizationMembershipGuard implements CanActivate {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
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

    const membership = await this.organizationMemberRepository.findMembership(
      organizationId,
      user.id,
    );

    if (!membership) {
      throw new ForbiddenException(
        'User is not a member of this organization',
      );
    }

    // Attach membership to request for use in controller
    request.orgMembership = membership;

    return true;
  }
}
