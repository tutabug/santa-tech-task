import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Optional() @Inject(PG_POOL) private readonly pool?: Pool) {
    const options = pool
      ? { adapter: new PrismaPg(pool) }
      : {
          adapter: new PrismaPg(
            new Pool({ connectionString: process.env.DATABASE_URL }),
          ),
        };

    super(options);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
