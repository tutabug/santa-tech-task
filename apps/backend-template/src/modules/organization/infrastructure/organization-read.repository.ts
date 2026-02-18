import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  OrganizationListItem,
  OrganizationListQuery,
  OrganizationReadRepository,
} from '../application';
import {
  encodeCursor,
  PaginatedResult,
} from '../../../common/pagination';

@Injectable()
export class OrganizationReadRepositoryImpl extends OrganizationReadRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(
    userId: string,
    query: OrganizationListQuery,
  ): Promise<PaginatedResult<OrganizationListItem>> {
    const { limit, cursor } = query;
    const take = limit + 1;

    const organizations = await this.prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
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
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      take,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
    });

    const hasMore = organizations.length > limit;
    const items = hasMore ? organizations.slice(0, limit) : organizations;
    const lastItem = items[items.length - 1];

    return {
      items,
      pagination: {
        limit,
        hasMore,
        nextCursor: hasMore && lastItem
          ? encodeCursor({
              createdAt: lastItem.createdAt,
              id: lastItem.id,
            })
          : null,
      },
    };
  }
}
