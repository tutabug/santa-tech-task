import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import { Organization } from '../domain/organization.entity';
import { OrganizationRepository } from '../domain/organization.repository.interface';
import { OrganizationMapper } from './organization.mapper';

@Injectable()
export class OrganizationRepositoryImpl extends OrganizationRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  async save(organization: Organization): Promise<Organization> {
    const data = OrganizationMapper.toPersistence(organization);

    const saved = await this.txHost.tx.organization.upsert({
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
    const organizations = await this.txHost.tx.organization.findMany({
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
