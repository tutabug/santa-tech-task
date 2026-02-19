import { Injectable, NotFoundException } from '@nestjs/common';
import { Song } from '../domain/song.entity';
import { SongRepository } from '../domain/song.repository.interface';

/**
 * Use Case: Get a Single Song by ID
 *
 * Responsibilities:
 * - Retrieves a song by its ID
 * - Throws NotFoundException if song not found
 * - Returns the domain aggregate
 * - NO business logic (pure retrieval)
 *
 * Input: songId
 * Output: Song aggregate
 * Throws: NotFoundException if not found
 */
@Injectable()
export class GetSongUseCase {
  constructor(private readonly songRepository: SongRepository) {}

  async execute(id: string): Promise<Song> {
    const song = await this.songRepository.findById(id);

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    return song;
  }
}
