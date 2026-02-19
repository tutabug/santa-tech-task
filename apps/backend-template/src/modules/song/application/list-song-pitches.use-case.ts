import { Injectable } from '@nestjs/common';
import {
  PitchListItem,
  PitchReadRepository,
} from './pitch-read.repository.interface';

/**
 * Use Case: List Pitches for a Song
 *
 * Responsibilities:
 * - Retrieves all pitches created for a specific song
 * - Thin orchestration only - delegates to read repository
 * - Returns flat read models (not aggregates)
 * - NO business logic
 *
 * Inputs: songId
 * Output: Array of PitchListItem read models
 */
@Injectable()
export class ListSongPitchesUseCase {
  constructor(private readonly pitchReadRepository: PitchReadRepository) {}

  async execute(songId: string): Promise<PitchListItem[]> {
    return this.pitchReadRepository.findBySongId(songId);
  }
}
