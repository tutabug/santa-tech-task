import { PaginatedResult, PaginationQuery } from '../../../common/pagination';

/**
 * Pitch List Item - Read Model
 *
 * Flattened representation of a Pitch used for list queries.
 * Includes minimal data needed for UI display.
 * Different from the domain Pitch aggregate (which is for write operations).
 */
export type PitchListItem = {
  id: string;
  songId: string;
  createdById: string;
  description: string;
  status: string;
  targetArtists: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Pitch List Query Type
 * Composition of PaginationQuery (limit, cursor)
 */
export type PitchListQuery = PaginationQuery;

/**
 * Pitch Read Repository Interface - Application Layer
 *
 * Defines the contract for querying pitches in read-optimized fashion.
 * Implementation lives in the infrastructure layer.
 *
 * Separated from PitchRepository (domain) because:
 * - Read repositories return flat read models (not aggregates)
 * - They use CQRS-lite pattern for optimal query efficiency
 * - No domain mapping overhead on reads
 */
export abstract class PitchReadRepository {
  /**
   * Finds pitches for a specific song with cursor-based pagination.
   * Results are sorted by creation date descending (newest first).
   *
   * @param songId - The song ID
   * @param query - Pagination query (limit, cursor)
   * @returns Paginated list of pitch read models
   */
  abstract findBySongId(
    songId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>>;

  /**
   * Finds pitches in an organization (across all songs) with cursor-based pagination.
   * Results are sorted by creation date descending (newest first).
   *
   * @param organizationId - The organization ID
   * @param query - Pagination query (limit, cursor)
   * @returns Paginated list of pitch read models
   */
  abstract findByOrganizationId(
    organizationId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>>;
}
