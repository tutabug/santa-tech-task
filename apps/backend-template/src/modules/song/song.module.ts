import { Module } from '@nestjs/common';
import { SongController } from './song.controller';
import { PitchController } from './pitch.controller';
import {
  UploadSongUseCase,
  ListOrganizationSongsUseCase,
  GetSongUseCase,
  SongReadRepository,
  OrgMembershipPort,
  CreatePitchUseCase,
  ListSongPitchesUseCase,
  ListOrganizationPitchesUseCase,
  PitchReadRepository,
} from './application';
import { SongRepository, PitchRepository } from './domain';
import {
  SongRepositoryImpl,
  SongReadRepositoryImpl,
  OrgMembershipAdapter,
  PitchRepositoryImpl,
  PitchReadRepositoryImpl,
} from './infrastructure';
import { SongMembershipGuard, SongRoleGuard } from './guards';

@Module({
  controllers: [SongController, PitchController],
  providers: [
    // Application Layer - Song Use Cases
    UploadSongUseCase,
    ListOrganizationSongsUseCase,
    GetSongUseCase,

    // Application Layer - Pitch Use Cases
    CreatePitchUseCase,
    ListSongPitchesUseCase,
    ListOrganizationPitchesUseCase,

    // Anti-Corruption Layer - Org membership port/adapter
    {
      provide: OrgMembershipPort,
      useClass: OrgMembershipAdapter,
    },

    // Guards (Song-owned, depend on OrgMembershipPort)
    SongMembershipGuard,
    SongRoleGuard,

    // Infrastructure Layer - Song Repository Implementations
    {
      provide: SongRepository,
      useClass: SongRepositoryImpl,
    },
    {
      provide: SongReadRepository,
      useClass: SongReadRepositoryImpl,
    },

    // Infrastructure Layer - Pitch Repository Implementations
    {
      provide: PitchRepository,
      useClass: PitchRepositoryImpl,
    },
    {
      provide: PitchReadRepository,
      useClass: PitchReadRepositoryImpl,
    },
  ],
  exports: [
    UploadSongUseCase,
    GetSongUseCase,
    SongRepository,
  ],
})
export class SongModule {}
