import { PaginatedResult, PaginationQuery } from '../../../common/pagination';
import { OrganizationRole } from '../domain';

export type OrganizationMemberListItem = {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  name: string | null;
  role: OrganizationRole;
  joinedAt: Date;
};

export type OrganizationMemberListQuery = PaginationQuery;

export abstract class OrganizationMemberReadRepository {
  abstract findByOrganizationId(
    organizationId: string,
    query: OrganizationMemberListQuery,
  ): Promise<PaginatedResult<OrganizationMemberListItem>>;
}
