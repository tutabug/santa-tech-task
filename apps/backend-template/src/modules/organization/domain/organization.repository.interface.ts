import { Organization } from './organization.entity';

export abstract class OrganizationRepository {
  abstract save(organization: Organization): Promise<Organization>;
  abstract findByUserId(userId: string): Promise<Organization[]>;
}
