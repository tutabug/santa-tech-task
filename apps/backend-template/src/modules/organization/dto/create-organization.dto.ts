import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Input DTO for creating a new organization.
 * Validates and transforms HTTP request body data.
 */
export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Songwriters United',
    description: 'The name of the organization',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'A collective of talented songwriters',
    description: 'Optional description of the organization',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
