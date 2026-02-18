import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationController } from './organization.controller';
import {
  CreateOrganizationUseCase,
  ListOrganizationMembersUseCase,
  ListUserOrganizationsUseCase,
  OrganizationMemberReadRepository,
  OrganizationReadRepository,
} from './application';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
} from './domain';
import {
  OrganizationMemberReadRepositoryImpl,
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
    ListOrganizationMembersUseCase,
    ListUserOrganizationsUseCase,

    // Infrastructure Layer - Repository Implementations
    {
      provide: OrganizationReadRepository,
      useClass: OrganizationReadRepositoryImpl,
    },
    {
      provide: OrganizationMemberReadRepository,
      useClass: OrganizationMemberReadRepositoryImpl,
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
    ListOrganizationMembersUseCase,
    ListUserOrganizationsUseCase,
    OrganizationMemberReadRepository,
    OrganizationReadRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
  ],
})
export class OrganizationModule {}
