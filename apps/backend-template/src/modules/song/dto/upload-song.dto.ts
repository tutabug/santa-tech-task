import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

/**
 * Input DTO for uploading a song.
 * Validates metadata fields from the request body.
 * File is handled separately via MultipartFile.
 */
export class UploadSongDto {
  @ApiProperty({
    example: 'Midnight Dreams',
    description: 'The title of the song',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Optional artist or composer name',
    required: false,
  })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiProperty({
    example: 240,
    description: 'Optional duration in seconds',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;
}
