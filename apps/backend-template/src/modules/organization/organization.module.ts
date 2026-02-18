import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationController } from './organization.controller';
import {
  CreateOrganizationUseCase,
  ListUserOrganizationsUseCase,
  OrganizationReadRepository,
} from './application';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
} from './domain';
import {
  OrganizationReadRepositoryImpl,
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
    ListUserOrganizationsUseCase,

    // Infrastructure Layer - Repository Implementations
    {
      provide: OrganizationReadRepository,
      useClass: OrganizationReadRepositoryImpl,
    },
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
    ListUserOrganizationsUseCase,
    OrganizationReadRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
  ],
})
export class OrganizationModule {}
