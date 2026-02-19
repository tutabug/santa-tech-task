import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination';
import {
  PitchListItem,
  PitchListQuery,
  PitchReadRepository,
} from './pitch-read.repository.interface';

/**
 * Use Case: List Pitches for a Song
 *
 * Responsibilities:
 * - Retrieves pitches for a specific song with pagination
 * - Thin orchestration only - delegates to read repository
 * - Returns flat read models (not aggregates)
 * - NO business logic
 *
 * Inputs: songId, query (limit, cursor)
 * Output: PaginatedResult<PitchListItem>
 */
@Injectable()
export class ListSongPitchesUseCase {
  constructor(private readonly pitchReadRepository: PitchReadRepository) {}

  async execute(
    songId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>> {
    return this.pitchReadRepository.findBySongId(songId, query);
  }
}
