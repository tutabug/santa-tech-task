export type OrganizationListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class OrganizationReadRepository {
  abstract findByUserId(userId: string): Promise<OrganizationListItem[]>;
}
