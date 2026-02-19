import { Pitch } from './pitch.entity';

/**
 * Pitch Repository Interface - Domain Layer (Write Side)
 *
 * Defines the contract for persisting and retrieving Pitch aggregates.
 * Implementation lives in the infrastructure layer.
 *
 * Read-optimized queries (listing) are handled by PitchReadRepository
 * in the application layer (CQRS-lite pattern).
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
}
