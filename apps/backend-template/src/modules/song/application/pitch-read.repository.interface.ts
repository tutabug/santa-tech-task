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
   * Finds all pitches for a specific song.
   * Results are sorted by creation date descending (newest first).
   *
   * @param songId - The song ID
   * @returns Array of pitch read models
   */
  abstract findBySongId(songId: string): Promise<PitchListItem[]>;

  /**
   * Finds all pitches in an organization (across all songs).
   * Results are sorted by creation date descending (newest first).
   *
   * @param organizationId - The organization ID
   * @returns Array of pitch read models
   */
  abstract findByOrganizationId(
    organizationId: string,
  ): Promise<PitchListItem[]>;
}
