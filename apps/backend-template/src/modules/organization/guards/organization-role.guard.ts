import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRole } from '../domain';
import { OrganizationMemberRepository } from '../domain';
import { REQUIRE_ORG_ROLE_KEY } from './require-org-role.decorator';

/**
 * Guard: Verify user has required role in organization
 *
 * Checks if the user is a member of the organization AND has the required role.
 * The required role is specified via @RequireOrgRole('MANAGER') decorator on the handler.
 *
 * Usage:
 *   @UseGuards(SessionGuard, OrganizationRoleGuard)
 *   @RequireOrgRole('MANAGER')
 *   async addMember(...) { }
 *
 * Requires: SessionGuard to run first (sets request.user)
 * Route param: :id (organization ID)
 * Decorator: @RequireOrgRole(role)
 */
@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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

    // Get required role from decorator metadata
    const requiredRole = this.reflector.get<OrganizationRole>(
      REQUIRE_ORG_ROLE_KEY,
      context.getHandler(),
    );

    const membership = await this.organizationMemberRepository.findMembership(
      organizationId,
      user.id,
    );

    if (!membership) {
      throw new ForbiddenException(
        'User is not a member of this organization',
      );
    }

    if (requiredRole && membership.role !== requiredRole) {
      throw new ForbiddenException(
        `User must have role ${requiredRole} to perform this action`,
      );
    }

    // Attach membership to request for use in controller
    request.orgMembership = membership;

    return true;
  }
}
