import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import {
  AddOrganizationMemberUseCase,
  CreateOrganizationUseCase,
  ListOrganizationMembersUseCase,
  ListUserOrganizationsUseCase,
  OrganizationMemberReadRepository,
  OrganizationReadRepository,
} from './application';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
  OrganizationMembershipDomainService,
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
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [OrganizationController],
  providers: [
    // Application Layer
    AddOrganizationMemberUseCase,
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

    // Domain Layer - Domain Services (wired via factory to stay framework-agnostic)
    {
      provide: OrganizationMembershipDomainService,
      useFactory: (repo: OrganizationMemberRepository) =>
        new OrganizationMembershipDomainService(repo),
      inject: [OrganizationMemberRepository],
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
