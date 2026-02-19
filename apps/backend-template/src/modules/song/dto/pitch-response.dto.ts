import { ApiProperty } from '@nestjs/swagger';
import { Pitch } from '../domain/pitch.entity';
import { PitchListItem } from '../application/pitch-read.repository.interface';

/**
 * Response DTO for Pitch - used at the presentation layer boundary.
 *
 * Provides two factory methods:
 * - fromAggregate(): maps from Pitch aggregate (after write operations)
 * - fromReadModel(): maps from PitchListItem (after read operations)
 */
export class PitchResponseDto {
  @ApiProperty({
    example: 'pitch-uuid-here',
    description: 'The unique identifier of the pitch',
  })
  id: string;

  @ApiProperty({
    example: 'song-uuid-here',
    description: 'The ID of the song being pitched',
  })
  songId: string;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'The ID of the user who created the pitch',
  })
  createdById: string;

  @ApiProperty({
    example: 'Upbeat pop track perfect for summer release',
    description: 'Description of the pitch',
  })
  description: string;

  @ApiProperty({
    example: 'DRAFT',
    description: 'Current status of the pitch',
    enum: ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED'],
  })
  status: string;

  @ApiProperty({
    example: ['Ariana Grande', 'Dua Lipa'],
    description: 'Target artist names',
    type: [String],
  })
  targetArtists: string[];

  @ApiProperty({
    example: ['pop', 'summer', 'upbeat'],
    description: 'Tags/labels for the pitch',
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    example: '2026-02-19T12:00:00.000Z',
    description: 'When the pitch was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-19T12:00:00.000Z',
    description: 'When the pitch was last updated',
  })
  updatedAt: Date;

  /**
   * Maps a Pitch aggregate to a response DTO.
   * Used after write operations (create).
   */
  static fromAggregate(pitch: Pitch): PitchResponseDto {
    const dto = new PitchResponseDto();
    dto.id = pitch.id;
    dto.songId = pitch.songId;
    dto.createdById = pitch.createdById;
    dto.description = pitch.description;
    dto.status = pitch.status;
    dto.targetArtists = pitch.targetArtists;
    dto.tags = pitch.tags;
    dto.createdAt = pitch.createdAt;
    dto.updatedAt = pitch.updatedAt;
    return dto;
  }

  /**
   * Maps a PitchListItem read model to a response DTO.
   * Used after read/list operations.
   */
  static fromReadModel(item: PitchListItem): PitchResponseDto {
    const dto = new PitchResponseDto();
    dto.id = item.id;
    dto.songId = item.songId;
    dto.createdById = item.createdById;
    dto.description = item.description;
    dto.status = item.status;
    dto.targetArtists = item.targetArtists;
    dto.tags = item.tags;
    dto.createdAt = item.createdAt;
    dto.updatedAt = item.updatedAt;
    return dto;
  }
}
