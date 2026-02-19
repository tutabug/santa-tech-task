import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import {
  PitchListItem,
  PitchListQuery,
  PitchReadRepository,
} from '../application/pitch-read.repository.interface';
import { CursorService, PaginatedResult } from '../../../common/pagination';

/**
 * Pitch Read Repository Implementation - Infrastructure Layer
 *
 * Implements read-optimized queries for pitch listing with cursor-based pagination.
 * Returns flat read models (PitchListItem) — no aggregate reconstruction.
 * Uses Prisma select for optimal query performance.
 *
 * Cursor pagination:
 * - Fetches (limit + 1) items to detect if more exist
 * - Uses OR conditions for cursor comparison on (createdAt, id) tuple
 * - Encodes cursor as base64 JSON for next page
 */
@Injectable()
export class PitchReadRepositoryImpl extends PitchReadRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
    private readonly cursorService: CursorService,
  ) {
    super();
  }

  /**
   * Finds pitches for a specific song with cursor-based pagination.
   * Joins targetArtists and tags to extract names inline.
   */
  async findBySongId(
    songId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>> {
    const { limit, cursor } = query;
    const take = limit + 1;

    const pitches = await this.txHost.tx.pitch.findMany({
      where: {
        songId,
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                {
                  createdAt: cursor.createdAt,
                  id: { lt: cursor.id },
                },
              ],
            }
          : {}),
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
      take,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = pitches.length > limit;
    const items = hasMore ? pitches.slice(0, limit) : pitches;
    const lastItem = items[items.length - 1];

    return {
      items: items.map((p) => ({
        id: p.id,
        songId: p.songId,
        createdById: p.createdById,
        description: p.description,
        status: p.status,
        targetArtists: p.targetArtists.map((ta) => ta.name),
        tags: p.tags.map((t) => t.name),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        limit,
        hasMore,
        nextCursor:
          hasMore && lastItem
            ? this.cursorService.encode({
                createdAt: lastItem.createdAt,
                id: lastItem.id,
              })
            : null,
      },
    };
  }

  /**
   * Finds pitches in an organization (across all songs) with cursor-based pagination.
   * Joins through the Song relation to filter by organizationId.
   */
  async findByOrganizationId(
    organizationId: string,
    query: PitchListQuery,
  ): Promise<PaginatedResult<PitchListItem>> {
    const { limit, cursor } = query;
    const take = limit + 1;

    const pitches = await this.txHost.tx.pitch.findMany({
      where: {
        song: { organizationId },
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                {
                  createdAt: cursor.createdAt,
                  id: { lt: cursor.id },
                },
              ],
            }
          : {}),
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
      take,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = pitches.length > limit;
    const items = hasMore ? pitches.slice(0, limit) : pitches;
    const lastItem = items[items.length - 1];

    return {
      items: items.map((p) => ({
        id: p.id,
        songId: p.songId,
        createdById: p.createdById,
        description: p.description,
        status: p.status,
        targetArtists: p.targetArtists.map((ta) => ta.name),
        tags: p.tags.map((t) => t.name),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        limit,
        hasMore,
        nextCursor:
          hasMore && lastItem
            ? this.cursorService.encode({
                createdAt: lastItem.createdAt,
                id: lastItem.id,
              })
            : null,
      },
    };
  }
}
