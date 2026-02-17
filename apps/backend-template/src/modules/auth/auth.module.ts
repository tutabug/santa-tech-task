import { BETTER_AUTH, createAuth } from './auth.config';
import { Global, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { DatabaseModule } from '../../database/database.module';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: BETTER_AUTH,
      useFactory: (prisma: PrismaService) => {
        return createAuth(prisma);
      },
      inject: [PrismaService],
    },
  ],
  exports: [BETTER_AUTH],
})
export class AuthModule {}
