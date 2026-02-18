import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  OrganizationMemberListItem,
  OrganizationMemberListQuery,
  OrganizationMemberReadRepository,
} from '../application';
import { CursorService, PaginatedResult } from '../../../common/pagination';

@Injectable()
export class OrganizationMemberReadRepositoryImpl extends OrganizationMemberReadRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cursorService: CursorService,
  ) {
    super();
  }

  async findByOrganizationId(
    organizationId: string,
    query: OrganizationMemberListQuery,
  ): Promise<PaginatedResult<OrganizationMemberListItem>> {
    const { limit, cursor } = query;
    const take = limit + 1;

    const members = await this.prisma.organizationMember.findMany({
      where: {
        organizationId,
        ...(cursor
          ? {
              OR: [
                { joinedAt: { lt: cursor.createdAt } },
                {
                  joinedAt: cursor.createdAt,
                  id: { lt: cursor.id },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      take,
      orderBy: [
        { joinedAt: 'desc' },
        { id: 'desc' },
      ],
    });

    const hasMore = members.length > limit;
    const items = hasMore ? members.slice(0, limit) : members;
    const lastItem = items[items.length - 1];

    return {
      items: items.map((member) => ({
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        email: member.user.email,
        name: member.user.name,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      pagination: {
        limit,
        hasMore,
        nextCursor:
          hasMore && lastItem
            ? this.cursorService.encode({
                createdAt: lastItem.joinedAt,
                id: lastItem.id,
              })
            : null,
      },
    };
  }
}
