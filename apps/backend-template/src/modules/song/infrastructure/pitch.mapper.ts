import { Pitch as PrismaPitch, PitchStatus as PrismaPitchStatus } from '@prisma/client';
import { Pitch, PitchStatus } from '../domain/pitch.entity';

/**
 * Pitch Mapper - Infrastructure Layer
 *
 * Responsible for converting between:
 * - Domain layer: Pitch aggregate (pure TS)
 * - Persistence layer: Prisma Pitch model + relations (PitchTargetArtist, Tag)
 *
 * Handles mapping of collections:
 * - targetArtists: extracted from PitchTargetArtist[] as string[] (names only)
 * - tags: extracted from Tag[] as string[] (names only)
 *
 * This mapper stays in infrastructure and is never accessed
 * from domain or application layers.
 */
export class PitchMapper {
  /**
   * Converts a Prisma Pitch record with relations to a domain Pitch aggregate.
   * Used when loading from database.
   *
   * @param raw - The Prisma Pitch record with targetArtists and tags included
   * @returns The Pitch domain aggregate
   */
  static toDomain(
    raw: PrismaPitch & {
      targetArtists: { id: string; pitchId: string; name: string }[];
      tags: { id: string; name: string }[];
    },
  ): Pitch {
    // Extract artist names from targetArtists array
    const targetArtists = raw.targetArtists.map((ta) => ta.name);

    // Extract tag names from tags array
    const tags = raw.tags.map((t) => t.name);

    // Map Prisma enum to domain enum (same values, so direct cast is safe)
    const status = raw.status as unknown as PitchStatus;

    return Pitch.reconstitute(
      raw.id,
      raw.songId,
      raw.createdById,
      raw.description,
      status,
      targetArtists,
      tags,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  /**
   * Converts a domain Pitch aggregate to persistence format.
   * Returns only the fields needed for database (no relations).
   * Used when saving to database.
   *
   * Note: Relations (targetArtists, tags) are handled separately by the repository
   * during save operations.
   *
   * @param pitch - The Pitch domain aggregate
   * @returns Persistence record (flat structure)
   */
  static toPersistence(
    pitch: Pitch,
  ): Omit<
    PrismaPitch,
    'targetArtists' | 'tags' | 'song' | 'createdBy'
  > {
    return {
      id: pitch.id,
      songId: pitch.songId,
      createdById: pitch.createdById,
      description: pitch.description,
      status: pitch.status as unknown as PrismaPitchStatus,
      createdAt: pitch.createdAt,
      updatedAt: pitch.updatedAt,
    };
  }
}
