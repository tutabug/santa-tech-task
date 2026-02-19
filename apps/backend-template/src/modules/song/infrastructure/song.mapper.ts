import { Song as PrismaSong } from '@prisma/client';
import { Song } from '../domain/song.entity';

/**
 * Song Mapper - Infrastructure Layer
 *
 * Responsible for converting between:
 * - Domain layer: Song aggregate (pure TS)
 * - Persistence layer: Prisma Song model (database)
 *
 * This mapper stays in infrastructure and is never accessed
 * from domain or application layers.
 */
export class SongMapper {
  /**
   * Converts a Prisma Song record to a domain Song aggregate.
   * Used when loading from database.
   */
  static toDomain(raw: PrismaSong): Song {
    return Song.reconstitute(
      raw.id,
      raw.title,
      raw.artist,
      raw.duration,
      raw.filePath,
      raw.mimeType,
      raw.fileSize,
      raw.uploadedById,
      raw.organizationId,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  /**
   * Converts a domain Song aggregate to persistence format.
   * Returns only the fields needed for database (no relations).
   * Used when saving to database.
   */
  static toPersistence(
    song: Song,
  ): Omit<PrismaSong, 'uploadedBy' | 'organization' | 'pitches'> {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      filePath: song.filePath,
      mimeType: song.mimeType,
      fileSize: song.fileSize,
      uploadedById: song.uploadedById,
      organizationId: song.organizationId,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };
  }
}
