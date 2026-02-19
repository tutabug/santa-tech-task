import { Injectable } from '@nestjs/common';
import {
  PitchListItem,
  PitchReadRepository,
} from './pitch-read.repository.interface';

/**
 * Use Case: List All Pitches in an Organization
 *
 * Responsibilities:
 * - Retrieves all pitches created in an organization (across all songs)
 * - Thin orchestration only - delegates to read repository
 * - Returns flat read models (not aggregates)
 * - NO business logic
 *
 * Inputs: organizationId
 * Output: Array of PitchListItem read models
 */
@Injectable()
export class ListOrganizationPitchesUseCase {
  constructor(private readonly pitchReadRepository: PitchReadRepository) {}

  async execute(organizationId: string): Promise<PitchListItem[]> {
    return this.pitchReadRepository.findByOrganizationId(organizationId);
  }
}
