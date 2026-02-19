import { PaginatedResult, PaginationQuery } from '../../../common/pagination';

/**
 * Song List Item - Read Model
 *
 * Flattened representation of a Song used for list queries.
 * Includes minimal data needed for UI display.
 * Different from the domain Song aggregate (which is for write operations).
 */
export type SongListItem = {
  id: string;
  title: string;
  artist: string | null;
  duration: number | null;
  mimeType: string | null;
  fileSize: number | null;
  uploadedById: string;
  uploaderName: string | null;
  uploaderEmail: string;
  createdAt: Date;
};

/**
 * Song List Query Type
 * Composition of PaginationQuery (limit, cursor)
 */
export type SongListQuery = PaginationQuery;

/**
 * Song Read Repository Interface - Application Layer
 *
 * Defines the contract for querying songs with cursor-based pagination.
 * Implementation lives in the infrastructure layer.
 *
 * Separated from SongRepository (domain) because:
 * - Read repositories return flat read models (not aggregates)
 * - They use CQRS-lite pattern for optimal query efficiency
 * - Implementation can be optimized with selective field fetches
 */
export abstract class SongReadRepository {
  /**
   * Finds songs belonging to an organization with cursor-based pagination.
   *
   * @param organizationId - The organization ID
   * @param query - Pagination query (limit, cursor)
   * @returns Paginated list of song read models
   */
  abstract findByOrganizationId(
    organizationId: string,
    query: SongListQuery,
  ): Promise<PaginatedResult<SongListItem>>;
}
