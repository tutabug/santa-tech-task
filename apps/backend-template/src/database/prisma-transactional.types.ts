import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './prisma.service';

/**
 * Type alias for the Prisma transactional adapter using our custom PrismaService.
 * Use this wherever you need TransactionHost<...> to avoid verbose generic parameters.
 *
 * Usage in repositories:
 *   constructor(private readonly txHost: TransactionHost<PrismaTransactionalAdapter>) {}
 */
export type PrismaTransactionalAdapter =
  TransactionalAdapterPrisma<PrismaService>;
