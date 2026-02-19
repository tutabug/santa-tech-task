import { ApiProperty } from '@nestjs/swagger';

/**
 * Read-model DTO for song list items.
 * Returned by query use cases to avoid aggregate mapping.
 * Includes uploader information (name and email) for display.
 */
export class SongListItemDto {
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
    example: 'John Doe',
    description: 'The name of the uploader',
    nullable: true,
  })
  uploaderName: string | null;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the uploader',
  })
  uploaderEmail: string;

  @ApiProperty({
    description: 'When the song was uploaded',
  })
  createdAt: Date;
}
