import { Song } from './song.entity';

/**
 * Song Repository Interface - Domain Layer
 *
 * Defines the contract for persisting and retrieving Song aggregates.
 * Implementation lives in the infrastructure layer.
 *
 * Following DDD: Repository interface is defined in domain layer,
 * implementation (with Prisma specifics) is in infrastructure layer.
 */
export abstract class SongRepository {
  /**
   * Saves (creates or updates) a Song aggregate.
   * Uses upsert logic to be idempotent.
   *
   * @param song - The Song aggregate to persist
   * @returns The persisted Song aggregate (with any DB-generated/updated fields)
   */
  abstract save(song: Song): Promise<Song>;

  /**
   * Retrieves a Song by its ID.
   *
   * @param id - The song ID
   * @returns The Song aggregate, or null if not found
   */
  abstract findById(id: string): Promise<Song | null>;

  /**
   * Retrieves all Songs belonging to an organization.
   *
   * @param organizationId - The organization ID
   * @returns Array of Song aggregates (may be empty if no songs)
   */
  abstract findByOrganizationId(organizationId: string): Promise<Song[]>;
}
