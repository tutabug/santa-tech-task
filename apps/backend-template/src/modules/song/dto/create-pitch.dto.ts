import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

/**
 * Input DTO for creating a pitch.
 * Validates request body fields.
 */
export class CreatePitchDto {
  @ApiProperty({
    example: 'Upbeat pop track perfect for summer release',
    description: 'Description of the pitch',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['Ariana Grande', 'Dua Lipa'],
    description: 'List of target artist names to pitch to',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  targetArtists: string[];

  @ApiProperty({
    example: ['pop', 'summer', 'upbeat'],
    description: 'Tags/labels for the pitch',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
