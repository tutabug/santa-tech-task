import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination';
import {
  PitchListItem,
  PitchListQuery,
  PitchReadRepository,
} from './pitch-read.repository.interface';

/**
 * Use Case: List All Pitches in an Organization
 *
 * Responsibilities:
 * - Retrieves all pitches in an organization (across all songs) with pagination
 * - Thin orchestration only - delegates to read repository
 * - Returns flat read models (not aggregates)
 * - NO business logic
 *
 * Inputs: organizationId, query (limit, cursor)
 * Output: PaginatedResult<PitchListItem>
 */
@Injectable()
export class ListOrganizationPitchesUseCase {
  constructor(private readonly pitchReadRepository: PitchReadRepository) {}

  async execute(
    organizationId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>> {
    return this.pitchReadRepository.findByOrganizationId(organizationId, query);
  }
}
