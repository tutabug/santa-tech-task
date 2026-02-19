import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Song } from '../domain/song.entity';
import { SongRepository } from '../domain/song.repository.interface';

/**
 * Use Case: Upload a Song
 *
 * Responsibilities:
 * - Creates a new Song aggregate with file metadata
 * - Persists the song to the repository
 * - Handles transactional atomicity
 * - NO business logic beyond factory and persistence
 *
 * Inputs: title, filePath, mimeType, fileSize, uploadedById, organizationId, optional artist/duration
 * Output: Created Song aggregate
 */
@Injectable()
export class UploadSongUseCase {
  constructor(private readonly songRepository: SongRepository) {}

  @Transactional()
  async execute(
    title: string,
    filePath: string,
    uploadedById: string,
    organizationId: string,
    artist?: string,
    duration?: number,
    mimeType?: string,
    fileSize?: number,
  ): Promise<Song> {
    // Domain creates the aggregate (with generated ID)
    const song = Song.create(
      title,
      filePath,
      uploadedById,
      organizationId,
      artist,
      duration,
      mimeType,
      fileSize,
    );

    // Persist the aggregate
    return this.songRepository.save(song);
  }
}
