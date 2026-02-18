import { PaginatedResult, PaginationCursor } from '../../../common/pagination';

export type OrganizationListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationListQuery = {
  limit: number;
  cursor?: PaginationCursor | null;
};

export abstract class OrganizationReadRepository {
  abstract findByUserId(
    userId: string,
    query: OrganizationListQuery,
  ): Promise<PaginatedResult<OrganizationListItem>>;
}
