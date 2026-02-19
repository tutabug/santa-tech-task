import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Pitch } from '../domain/pitch.entity';
import { PitchRepository } from '../domain/pitch.repository.interface';
import { SongRepository } from '../domain/song.repository.interface';

/**
 * Use Case: Create a Pitch
 *
 * Responsibilities:
 * - Validates that the song exists and belongs to the organization
 * - Creates a new Pitch aggregate with provided data
 * - Persists the pitch to the repository
 * - Handles transactional atomicity
 * - NO business logic beyond factory, validation, and persistence
 *
 * Inputs: songId, organizationId, createdById, description, targetArtists, tags
 * Output: Created Pitch aggregate
 */
@Injectable()
export class CreatePitchUseCase {
  constructor(
    private readonly pitchRepository: PitchRepository,
    private readonly songRepository: SongRepository,
  ) {}

  @Transactional()
  async execute(
    songId: string,
    organizationId: string,
    createdById: string,
    description: string,
    targetArtists: string[],
    tags: string[],
  ): Promise<Pitch> {
    // Verify song exists and belongs to the organization
    const song = await this.songRepository.findById(songId);

    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }

    if (!song.belongsToOrganization(organizationId)) {
      throw new BadRequestException(
        'Song does not belong to the specified organization',
      );
    }

    // Domain creates the aggregate (with generated ID, defaulted status to DRAFT)
    const pitch = Pitch.create(
      songId,
      createdById,
      description,
      targetArtists,
      tags,
    );

    // Persist the aggregate
    return this.pitchRepository.save(pitch);
  }
}
