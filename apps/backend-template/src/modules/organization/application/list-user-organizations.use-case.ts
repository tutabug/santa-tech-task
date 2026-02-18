import { Injectable } from '@nestjs/common';
import {
  OrganizationListItem,
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
 * Input: userId
 * Output: OrganizationListItem[] (sorted by createdAt desc)
 */
@Injectable()
export class ListUserOrganizationsUseCase {
  constructor(
    private readonly organizationReadRepository: OrganizationReadRepository,
  ) {}

  async execute(userId: string): Promise<OrganizationListItem[]> {
    return this.organizationReadRepository.findByUserId(userId);
  }
}
