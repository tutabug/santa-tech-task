import { Organization as PrismaOrganization } from '@prisma/client';
import { Organization } from '../domain/organization.entity';

export class OrganizationMapper {
  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.reconstitute(
      raw.id,
      raw.name,
      raw.description,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(organization: Organization): Omit<
    PrismaOrganization,
    'members' | 'songs'
  > {
    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
