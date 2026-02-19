import { DuplicateResourceError } from '../../../common/errors';
import { OrganizationMember, OrganizationRole } from './organization-member.entity';
import { OrganizationMemberRepository } from './organization-member.repository.interface';

/**
 * Domain Service: Organization Membership
 *
 * Encapsulates the business invariant that a user cannot be added
 * to an organization they already belong to.
 *
 * This logic lives in a domain service (rather than in an entity)
 * because enforcing uniqueness across aggregates requires a
 * repository query — something entities must not perform.
 */
export class OrganizationMembershipDomainService {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  /**
   * Adds a user as a member of an organization with the given role.
   *
   * @throws DuplicateResourceError if the user is already a member of the organization
   */
  async addMember(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    const existingMembership =
      await this.organizationMemberRepository.findMembership(
        organizationId,
        userId,
      );

    if (existingMembership) {
      throw new DuplicateResourceError('User is already a member of this organization');
    }

    return OrganizationMember.create(organizationId, userId, role);
  }
}
