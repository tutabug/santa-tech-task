import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import {
  OrganizationMember,
} from '../domain/organization-member.entity';
import { OrganizationMemberRepository } from '../domain/organization-member.repository.interface';
import { OrganizationMemberMapper } from './organization-member.mapper';

@Injectable()
export class OrganizationMemberRepositoryImpl extends OrganizationMemberRepository {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  async save(member: OrganizationMember): Promise<OrganizationMember> {
    const data = OrganizationMemberMapper.toPersistence(member);

    const saved = await this.txHost.tx.organizationMember.upsert({
      where: { id: member.id },
      update: {
        role: data.role,
      },
      create: {
        id: data.id,
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
      },
    });

    return OrganizationMemberMapper.toDomain(saved);
  }

  async findMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | null> {
    const member = await this.txHost.tx.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    if (!member) return null;
    return OrganizationMemberMapper.toDomain(member);
  }
}
