import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import { Song } from '../domain/song.entity';
import { SongRepository } from '../domain/song.repository.interface';
import { SongMapper } from './song.mapper';

/**
 * Song Repository Implementation - Infrastructure Layer
 *
 * Implements the SongRepository interface using Prisma ORM.
 * Uses TransactionHost for transactional operations.
 * All Prisma-specific logic is isolated here.
 */
@Injectable()
export class SongRepositoryImpl extends SongRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  /**
   * Saves (creates or updates) a Song aggregate.
   * Uses upsert pattern for idempotent saves.
   *
   * @param song - The Song aggregate to persist
   * @returns The persisted Song aggregate (with any DB-generated/updated fields)
   */
  async save(song: Song): Promise<Song> {
    const data = SongMapper.toPersistence(song);

    const saved = await this.txHost.tx.song.upsert({
      where: { id: song.id },
      update: {
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        filePath: data.filePath,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        filePath: data.filePath,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        uploadedById: data.uploadedById,
        organizationId: data.organizationId,
      },
    });

    return SongMapper.toDomain(saved);
  }

  /**
   * Retrieves a Song by its ID.
   *
   * @param id - The song ID
   * @returns The Song aggregate, or null if not found
   */
  async findById(id: string): Promise<Song | null> {
    const song = await this.txHost.tx.song.findUnique({
      where: { id },
    });

    if (!song) return null;

    return SongMapper.toDomain(song);
  }

  /**
   * Retrieves all Songs belonging to an organization.
   * Results are sorted by creation date descending.
   *
   * @param organizationId - The organization ID
   * @returns Array of Song aggregates (may be empty if no songs)
   */
  async findByOrganizationId(organizationId: string): Promise<Song[]> {
    const songs = await this.txHost.tx.song.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return songs.map(SongMapper.toDomain);
  }
}
