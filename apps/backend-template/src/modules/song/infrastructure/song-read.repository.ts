import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import {
  SongListItem,
  SongListQuery,
  SongReadRepository,
} from '../application/song-read.repository.interface';
import { CursorService, PaginatedResult } from '../../../common/pagination';

/**
 * Song Read Repository Implementation - Infrastructure Layer
 *
 * Implements cursor-based pagination for song listing.
 * Optimized for read performance using Prisma select (no full aggregate load).
 * Joins with User to include uploader information.
 *
 * Cursor pagination:
 * - Fetches (limit + 1) songs to detect if more exist
 * - Uses OR conditions for cursor comparison on (createdAt, id) tuple
 * - Encodes cursor as base64 JSON for next page
 */
@Injectable()
export class SongReadRepositoryImpl extends SongReadRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
    private readonly cursorService: CursorService,
  ) {
    super();
  }

  /**
   * Finds songs belonging to an organization with cursor-based pagination.
   * Results are sorted by createdAt descending (newest first).
   *
   * @param organizationId - The organization ID
   * @param query - Pagination query with limit and optional cursor
   * @returns Paginated result with song list items and pagination metadata
   */
  async findByOrganizationId(
    organizationId: string,
    query: SongListQuery,
  ): Promise<PaginatedResult<SongListItem>> {
    const { limit, cursor } = query;
    const take = limit + 1; // Fetch one extra to detect if more exist

    const songs = await this.txHost.tx.song.findMany({
      where: {
        organizationId,
        // Cursor-based pagination: filter songs before the cursor
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
        title: true,
        artist: true,
        duration: true,
        mimeType: true,
        fileSize: true,
        uploadedById: true,
        createdAt: true,
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    // Determine if there are more results
    const hasMore = songs.length > limit;
    const items = hasMore ? songs.slice(0, limit) : songs;
    const lastItem = items[items.length - 1];

    return {
      items: items.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        mimeType: song.mimeType,
        fileSize: song.fileSize,
        uploadedById: song.uploadedById,
        uploaderName: song.uploadedBy.name,
        uploaderEmail: song.uploadedBy.email,
        createdAt: song.createdAt,
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
