import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/user.repository.interface';
import { UserApplicationService } from './application';
import { UserController } from './user.controller';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [
    // Application Layer
    UserApplicationService,
    // Infrastructure Layer
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserApplicationService],
})
export class UserModule {}
