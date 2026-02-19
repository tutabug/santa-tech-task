import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import { Pitch } from '../domain/pitch.entity';
import { PitchRepository } from '../domain/pitch.repository.interface';
import { PitchMapper } from './pitch.mapper';

/**
 * Pitch Repository Implementation - Infrastructure Layer
 *
 * Implements the PitchRepository interface using Prisma ORM.
 * Uses TransactionHost for transactional operations.
 * All Prisma-specific logic is isolated here.
 *
 * Handles collection persistence:
 * - targetArtists: deleted and recreated on each save (simple lifecycle)
 * - tags: connected or created by name via connectOrCreate (find-or-create pattern)
 */
@Injectable()
export class PitchRepositoryImpl extends PitchRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  /**
   * Saves (creates or updates) a Pitch aggregate.
   * Uses upsert pattern for idempotent saves.
   *
   * Handles:
   * - targetArtists: deletes existing, creates new (simple lifecycle per save)
   * - tags: connects or creates by name (find-or-create pattern)
   *
   * @param pitch - The Pitch aggregate to persist
   * @returns The persisted Pitch aggregate with relations loaded
   */
  async save(pitch: Pitch): Promise<Pitch> {
    const data = PitchMapper.toPersistence(pitch);

    const saved = await this.txHost.tx.pitch.upsert({
      where: { id: pitch.id },
      update: {
        description: data.description,
        status: data.status,
        updatedAt: new Date(),
        // Delete existing target artists and recreate
        targetArtists: {
          deleteMany: {},
          create: pitch.targetArtists.map((name) => ({ name })),
        },
        // Connect or create tags by name
        tags: {
          connect: pitch.tags.map((name) => ({ name })),
        },
      },
      create: {
        id: data.id,
        songId: data.songId,
        createdById: data.createdById,
        description: data.description,
        status: data.status,
        targetArtists: {
          create: pitch.targetArtists.map((name) => ({ name })),
        },
        tags: {
          connectOrCreate: pitch.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      // Always include relations for mapping
      include: {
        targetArtists: true,
        tags: true,
      },
    });

    return PitchMapper.toDomain(saved);
  }

  /**
   * Retrieves a Pitch by its ID.
   *
   * @param id - The pitch ID
   * @returns The Pitch aggregate, or null if not found
   */
  async findById(id: string): Promise<Pitch | null> {
    const pitch = await this.txHost.tx.pitch.findUnique({
      where: { id },
      include: {
        targetArtists: true,
        tags: true,
      },
    });

    if (!pitch) return null;

    return PitchMapper.toDomain(pitch);
  }

  /**
   * Retrieves all Pitches for a specific song.
   * Results are sorted by creation date descending (newest first).
   *
   * @param songId - The song ID
   * @returns Array of Pitch aggregates (may be empty if no pitches)
   */
  async findBySongId(songId: string): Promise<Pitch[]> {
    const pitches = await this.txHost.tx.pitch.findMany({
      where: { songId },
      include: {
        targetArtists: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pitches.map((pitch) => PitchMapper.toDomain(pitch));
  }

  /**
   * Retrieves all Pitches in an organization.
   * This queries across all songs in the organization by joining through the Song relation.
   * Results are sorted by creation date descending (newest first).
   *
   * @param organizationId - The organization ID
   * @returns Array of Pitch aggregates (may be empty if no pitches)
   */
  async findByOrganizationId(organizationId: string): Promise<Pitch[]> {
    const pitches = await this.txHost.tx.pitch.findMany({
      where: {
        song: {
          organizationId,
        },
      },
      include: {
        targetArtists: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pitches.map((pitch) => PitchMapper.toDomain(pitch));
  }
}
