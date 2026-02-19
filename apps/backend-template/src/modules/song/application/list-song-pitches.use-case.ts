import { Injectable } from '@nestjs/common';
import { Pitch } from '../domain/pitch.entity';
import { PitchRepository } from '../domain/pitch.repository.interface';

/**
 * Use Case: List Pitches for a Song
 *
 * Responsibilities:
 * - Retrieves all pitches created for a specific song
 * - Thin orchestration only - delegates to repository
 * - NO business logic
 *
 * Inputs: songId
 * Output: Array of Pitch aggregates
 */
@Injectable()
export class ListSongPitchesUseCase {
  constructor(private readonly pitchRepository: PitchRepository) {}

  async execute(songId: string): Promise<Pitch[]> {
    return this.pitchRepository.findBySongId(songId);
  }
}
