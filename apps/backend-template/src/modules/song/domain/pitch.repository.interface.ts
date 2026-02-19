import { Pitch } from './pitch.entity';

/**
 * Pitch Repository Interface - Domain Layer
 *
 * Defines the contract for persisting and retrieving Pitch aggregates.
 * Implementation lives in the infrastructure layer.
 *
 * Following DDD: Repository interface is defined in domain layer,
 * implementation (with Prisma specifics) is in infrastructure layer.
 */
export abstract class PitchRepository {
  /**
   * Saves (creates or updates) a Pitch aggregate.
   * Uses upsert logic to be idempotent.
   *
   * @param pitch - The Pitch aggregate to persist
   * @returns The persisted Pitch aggregate (with any DB-generated/updated fields)
   */
  abstract save(pitch: Pitch): Promise<Pitch>;

  /**
   * Retrieves a Pitch by its ID.
   *
   * @param id - The pitch ID
   * @returns The Pitch aggregate, or null if not found
   */
  abstract findById(id: string): Promise<Pitch | null>;

  /**
   * Retrieves all Pitches for a specific song.
   *
   * @param songId - The song ID
   * @returns Array of Pitch aggregates (may be empty if no pitches)
   */
  abstract findBySongId(songId: string): Promise<Pitch[]>;

  /**
   * Retrieves all Pitches in an organization.
   * This queries across all songs in the organization.
   *
   * @param organizationId - The organization ID
   * @returns Array of Pitch aggregates (may be empty if no pitches)
   */
  abstract findByOrganizationId(organizationId: string): Promise<Pitch[]>;
}
