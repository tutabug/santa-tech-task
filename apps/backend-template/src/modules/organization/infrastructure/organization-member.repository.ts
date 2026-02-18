import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  OrganizationMember,
  OrganizationRole,
} from '../domain/organization-member.entity';
import { OrganizationMemberRepository } from '../domain/organization-member.repository.interface';
import { OrganizationMemberMapper } from './organization-member.mapper';

@Injectable()
export class OrganizationMemberRepositoryImpl extends OrganizationMemberRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(member: OrganizationMember): Promise<OrganizationMember> {
    const data = OrganizationMemberMapper.toPersistence(member);

    const saved = await this.prisma.organizationMember.upsert({
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
}
