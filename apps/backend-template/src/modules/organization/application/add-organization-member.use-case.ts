import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { DuplicateResourceError } from '../../../common/errors';
import {
  OrganizationMember,
  OrganizationMemberRepository,
  OrganizationMembershipDomainService,
  OrganizationRole,
} from '../domain';
import { UserApplicationService } from '../../user/application';

/**
 * Use Case: Add an existing user as a member to an organization
 *
 * Responsibilities:
 * - Orchestrates lookup of user by email
 * - Delegates membership creation (with duplicate guard) to the domain service
 * - Persists the new membership
 * - Maps domain errors to HTTP exceptions
 * - Handles transactional atomicity
 *
 * Inputs: organizationId, email, role
 * Output: Created OrganizationMember aggregate
 *
 * Throws:
 * - NotFoundException if user with email does not exist
 * - ConflictException if user is already a member of the organization
 */
@Injectable()
export class AddOrganizationMemberUseCase {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly userApplicationService: UserApplicationService,
    private readonly membershipDomainService: OrganizationMembershipDomainService,
  ) {}

  @Transactional()
  async execute(
    organizationId: string,
    email: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    // Lookup user by email (orchestration concern)
    const user = await this.userApplicationService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Delegate to domain service (business invariant: no duplicate members)
    let membership: OrganizationMember;
    try {
      membership = await this.membershipDomainService.addMember(
        organizationId,
        user.id,
        role,
      );
    } catch (error) {
      if (error instanceof DuplicateResourceError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    // Persist membership
    return this.organizationMemberRepository.save(membership);
  }
}
