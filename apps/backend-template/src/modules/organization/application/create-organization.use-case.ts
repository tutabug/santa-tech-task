import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  Organization,
  OrganizationMember,
  OrganizationRole,
} from '../domain';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
} from '../domain';

/**
 * Use Case: Create a new organization
 *
 * Responsibilities:
 * - Orchestrates creation of Organization aggregate
 * - Auto-adds creator as MANAGER member
 * - Handles transactional atomicity
 * - No business logic here (all in domain entities)
 *
 * Inputs: name, description (optional), creatorId
 * Output: Created Organization aggregate
 */
@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  @Transactional()
  async execute(
    name: string,
    creatorId: string,
    description?: string,
  ): Promise<Organization> {
    const org = Organization.create(name, description);

    const membership = OrganizationMember.create(
      org.id,
      creatorId,
      OrganizationRole.MANAGER,
    );

    await this.organizationRepository.save(org);
    await this.organizationMemberRepository.save(membership);

    return org;
  }
}
