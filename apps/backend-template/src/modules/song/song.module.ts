import { Module } from '@nestjs/common';
import { SongController } from './song.controller';
import {
  UploadSongUseCase,
  ListOrganizationSongsUseCase,
  GetSongUseCase,
  SongReadRepository,
} from './application';
import { SongRepository } from './domain';
import {
  SongRepositoryImpl,
  SongReadRepositoryImpl,
} from './infrastructure';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [OrganizationModule],
  controllers: [SongController],
  providers: [
    // Application Layer - Use Cases
    UploadSongUseCase,
    ListOrganizationSongsUseCase,
    GetSongUseCase,

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
