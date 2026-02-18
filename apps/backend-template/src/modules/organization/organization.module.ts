import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationController } from './organization.controller';
import { CreateOrganizationUseCase } from './application';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
} from './domain';
import {
  OrganizationRepositoryImpl,
  OrganizationMemberRepositoryImpl,
} from './infrastructure';
import {
  OrganizationMembershipGuard,
  OrganizationRoleGuard,
} from './guards';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController],
  providers: [
    // Application Layer
    CreateOrganizationUseCase,

    // Infrastructure Layer - Repository Implementations
    {
      provide: OrganizationRepository,
      useClass: OrganizationRepositoryImpl,
    },
    {
      provide: OrganizationMemberRepository,
      useClass: OrganizationMemberRepositoryImpl,
    },

    // Guards
    OrganizationMembershipGuard,
    OrganizationRoleGuard,
  ],
  exports: [
    CreateOrganizationUseCase,
    OrganizationRepository,
    OrganizationMemberRepository,
  ],
})
export class OrganizationModule {}
