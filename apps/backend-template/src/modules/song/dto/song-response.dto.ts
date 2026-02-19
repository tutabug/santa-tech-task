import { ApiProperty } from '@nestjs/swagger';
import { Song } from '../domain/song.entity';

/**
 * Response DTO for Song - used at the presentation layer boundary.
 * Maps Song aggregate to API response format.
 */
export class SongResponseDto {
  @ApiProperty({
    example: 'song-uuid-here',
    description: 'The unique identifier of the song',
  })
  id: string;

  @ApiProperty({
    example: 'Midnight Dreams',
    description: 'The title of the song',
  })
  title: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The artist or composer name',
    nullable: true,
  })
  artist: string | null;

  @ApiProperty({
    example: 240,
    description: 'Duration in seconds',
    nullable: true,
  })
  duration: number | null;

  @ApiProperty({
    example: '/uploads/songs/midnight-dreams-123.mp3',
    description: 'Local filesystem path where the file is stored',
  })
  filePath: string;

  @ApiProperty({
    example: 'audio/mpeg',
    description: 'MIME type of the uploaded file',
    nullable: true,
  })
  mimeType: string | null;

  @ApiProperty({
    example: 5242880,
    description: 'File size in bytes',
    nullable: true,
  })
  fileSize: number | null;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'The user ID of the uploader',
  })
  uploadedById: string;

  @ApiProperty({
    example: 'org-uuid-here',
    description: 'The organization ID this song belongs to',
  })
  organizationId: string;

  @ApiProperty({
    description: 'When the song was uploaded',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the song was last modified',
  })
  updatedAt: Date;

  /**
   * Maps a Song aggregate to a response DTO.
   * This static method is the boundary mapper from domain to presentation.
   */
  static fromAggregate(song: Song): SongResponseDto {
    const dto = new SongResponseDto();
    dto.id = song.id;
    dto.title = song.title;
    dto.artist = song.artist;
    dto.duration = song.duration;
    dto.filePath = song.filePath;
    dto.mimeType = song.mimeType;
    dto.fileSize = song.fileSize;
    dto.uploadedById = song.uploadedById;
    dto.organizationId = song.organizationId;
    dto.createdAt = song.createdAt;
    dto.updatedAt = song.updatedAt;
    return dto;
  }
}
