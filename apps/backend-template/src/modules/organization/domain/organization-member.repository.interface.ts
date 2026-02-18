import { OrganizationMember } from './organization-member.entity';

export abstract class OrganizationMemberRepository {
  abstract save(member: OrganizationMember): Promise<OrganizationMember>;
}
