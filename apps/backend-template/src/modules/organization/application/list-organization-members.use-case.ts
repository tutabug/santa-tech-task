import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination';
import {
  OrganizationMemberListItem,
  OrganizationMemberListQuery,
  OrganizationMemberReadRepository,
} from './organization-member-read.repository.interface';

/**
 * Use Case: List all members for an organization
 *
 * Responsibilities:
 * - Fetches all members of the organization
 * - Returns list of member read models
 * - Optimized query at repository level (joins user data)
 *
 * Input: organizationId, query
 * Output: PaginatedResult<OrganizationMemberListItem> (sorted by joinedAt desc)
 */
@Injectable()
export class ListOrganizationMembersUseCase {
  constructor(
    private readonly organizationMemberReadRepository: OrganizationMemberReadRepository,
  ) {}

  async execute(
    organizationId: string,
    query: OrganizationMemberListQuery,
  ): Promise<PaginatedResult<OrganizationMemberListItem>> {
    return this.organizationMemberReadRepository.findByOrganizationId(
      organizationId,
      query,
    );
  }
}
