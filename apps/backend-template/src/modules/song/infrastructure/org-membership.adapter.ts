import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { OrganizationRole } from '@prisma/client';
import { PrismaTransactionalAdapter } from '../../../database/prisma-transactional.types';
import { OrgMembershipPort } from '../application/org-membership.port';

/**
 * Infrastructure adapter implementing OrgMembershipPort.
 *
 * Queries the organizationMember table directly via Prisma,
 * without importing any Organization domain classes.
 */
@Injectable()
export class OrgMembershipAdapter extends OrgMembershipPort {
  constructor(
    private readonly txHost: TransactionHost<PrismaTransactionalAdapter>,
  ) {
    super();
  }

  async isMember(
    organizationId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.txHost.tx.organizationMember.findFirst({
      where: { organizationId, userId },
    });
    return !!member;
  }

  async hasRole(
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<boolean> {
    const member = await this.txHost.tx.organizationMember.findFirst({
      where: { organizationId, userId, role: role as OrganizationRole },
    });
    return !!member;
  }
}
