import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Organization } from '../domain/organization.entity';
import { OrganizationRepository } from '../domain/organization.repository.interface';
import { OrganizationMapper } from './organization.mapper';

@Injectable()
export class OrganizationRepositoryImpl extends OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(organization: Organization): Promise<Organization> {
    const data = OrganizationMapper.toPersistence(organization);

    const saved = await this.prisma.organization.upsert({
      where: { id: organization.id },
      update: {
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        name: data.name,
        description: data.description,
      },
    });

    return OrganizationMapper.toDomain(saved);
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations.map(OrganizationMapper.toDomain);
  }
}
