import { PaginatedResult, PaginationQuery } from '../../../common/pagination';

export type OrganizationListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationListQuery = PaginationQuery;

export abstract class OrganizationReadRepository {
  abstract findByUserId(
    userId: string,
    query: OrganizationListQuery,
  ): Promise<PaginatedResult<OrganizationListItem>>;
}
