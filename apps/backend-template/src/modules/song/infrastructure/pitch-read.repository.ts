import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import {
  PitchListItem,
  PitchReadRepository,
} from '../application/pitch-read.repository.interface';

/**
 * Pitch Read Repository Implementation - Infrastructure Layer
 *
 * Implements read-optimized queries for pitch listing.
 * Returns flat read models (PitchListItem) — no aggregate reconstruction.
 * Uses Prisma select for optimal query performance.
 */
@Injectable()
export class PitchReadRepositoryImpl extends PitchReadRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  /**
   * Finds all pitches for a specific song.
   * Joins targetArtists and tags to extract names inline.
   */
  async findBySongId(songId: string): Promise<PitchListItem[]> {
    const pitches = await this.txHost.tx.pitch.findMany({
      where: { songId },
      select: {
        id: true,
        songId: true,
        createdById: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        targetArtists: { select: { name: true } },
        tags: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pitches.map((p) => ({
      id: p.id,
      songId: p.songId,
      createdById: p.createdById,
      description: p.description,
      status: p.status,
      targetArtists: p.targetArtists.map((ta) => ta.name),
      tags: p.tags.map((t) => t.name),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Finds all pitches in an organization (across all songs).
   * Joins through the Song relation to filter by organizationId.
   */
  async findByOrganizationId(
    organizationId: string,
  ): Promise<PitchListItem[]> {
    const pitches = await this.txHost.tx.pitch.findMany({
      where: {
        song: { organizationId },
      },
      select: {
        id: true,
        songId: true,
        createdById: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        targetArtists: { select: { name: true } },
        tags: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pitches.map((p) => ({
      id: p.id,
      songId: p.songId,
      createdById: p.createdById,
      description: p.description,
      status: p.status,
      targetArtists: p.targetArtists.map((ta) => ta.name),
      tags: p.tags.map((t) => t.name),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
