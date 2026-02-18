import {
  OrganizationMember as PrismaOrganizationMember,
  OrganizationRole,
} from '@prisma/client';
import {
  OrganizationMember,
  OrganizationRole as DomainOrganizationRole,
} from '../domain/organization-member.entity';

export class OrganizationMemberMapper {
  static toDomain(raw: PrismaOrganizationMember): OrganizationMember {
    return OrganizationMember.reconstitute(
      raw.id,
      raw.organizationId,
      raw.userId,
      raw.role as DomainOrganizationRole,
      raw.joinedAt,
    );
  }

  static toPersistence(
    member: OrganizationMember,
  ): Omit<PrismaOrganizationMember, 'organization' | 'user'> {
    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role as OrganizationRole,
      joinedAt: member.joinedAt,
    };
  }
}
