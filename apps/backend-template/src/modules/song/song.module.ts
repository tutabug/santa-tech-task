import { Module } from '@nestjs/common';
import { SongController } from './song.controller';
import {
  UploadSongUseCase,
  ListOrganizationSongsUseCase,
  GetSongUseCase,
  SongReadRepository,
  OrgMembershipPort,
} from './application';
import { SongRepository } from './domain';
import {
  SongRepositoryImpl,
  SongReadRepositoryImpl,
  OrgMembershipAdapter,
} from './infrastructure';
import { SongMembershipGuard, SongRoleGuard } from './guards';

@Module({
  controllers: [SongController],
  providers: [
    // Application Layer - Use Cases
    UploadSongUseCase,
    ListOrganizationSongsUseCase,
    GetSongUseCase,

    // Anti-Corruption Layer - Org membership port/adapter
    {
      provide: OrgMembershipPort,
      useClass: OrgMembershipAdapter,
    },

    // Guards (Song-owned, depend on OrgMembershipPort)
    SongMembershipGuard,
    SongRoleGuard,

    // Infrastructure Layer - Repository Implementations
    {
      provide: SongRepository,
      useClass: SongRepositoryImpl,
    },
    {
      provide: SongReadRepository,
      useClass: SongReadRepositoryImpl,
    },
  ],
  exports: [
    UploadSongUseCase,
    GetSongUseCase,
    SongRepository,
  ],
})
export class SongModule {}
