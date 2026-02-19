import { Injectable } from '@nestjs/common';
import { Pitch } from '../domain/pitch.entity';
import { PitchRepository } from '../domain/pitch.repository.interface';

/**
 * Use Case: List All Pitches in an Organization
 *
 * Responsibilities:
 * - Retrieves all pitches created in an organization (across all songs)
 * - Thin orchestration only - delegates to repository
 * - NO business logic
 *
 * Inputs: organizationId
 * Output: Array of Pitch aggregates
 */
@Injectable()
export class ListOrganizationPitchesUseCase {
  constructor(private readonly pitchRepository: PitchRepository) {}

  async execute(organizationId: string): Promise<Pitch[]> {
    return this.pitchRepository.findByOrganizationId(organizationId);
  }
}
