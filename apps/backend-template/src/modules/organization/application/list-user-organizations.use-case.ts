import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination';
import {
  OrganizationListItem,
  OrganizationListQuery,
  OrganizationReadRepository,
} from './organization-read.repository.interface';

/**
 * Use Case: List all organizations for a user
 *
 * Responsibilities:
 * - Fetches all organizations where the user is a member
 * - Returns list of organization read models
 * - Optimized query at repository level (no need to load all members)
 *
 * Input: userId, query
 * Output: PaginatedResult<OrganizationListItem> (sorted by createdAt desc)
 */
@Injectable()
export class ListUserOrganizationsUseCase {
  constructor(
    private readonly organizationReadRepository: OrganizationReadRepository,
  ) {}

  async execute(
    userId: string,
    query: OrganizationListQuery,
  ): Promise<PaginatedResult<OrganizationListItem>> {
    return this.organizationReadRepository.findByUserId(userId, query);
  }
}
