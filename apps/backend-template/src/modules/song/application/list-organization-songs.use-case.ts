import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination';
import {
  SongListItem,
  SongListQuery,
  SongReadRepository,
} from './song-read.repository.interface';

/**
 * Use Case: List all Songs in an Organization
 *
 * Responsibilities:
 * - Retrieves songs for the organization with pagination
 * - Returns list of song read models
 * - Delegates to read repository for query optimization
 * - NO business logic (pure orchestration)
 *
 * Input: organizationId, query (limit, cursor)
 * Output: PaginatedResult<SongListItem> (sorted by createdAt desc)
 */
@Injectable()
export class ListOrganizationSongsUseCase {
  constructor(
    private readonly songReadRepository: SongReadRepository,
  ) {}

  async execute(
    organizationId: string,
    query: SongListQuery,
  ): Promise<PaginatedResult<SongListItem>> {
    return this.songReadRepository.findByOrganizationId(organizationId, query);
  }
}
