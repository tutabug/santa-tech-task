import { ApiProperty } from '@nestjs/swagger';

/**
 * Read-model DTO for organization list items.
 * Returned by query use cases to avoid aggregate mapping.
 */
export class OrganizationListItemDto {
  @ApiProperty({
    example: 'org-uuid-here',
    description: 'The unique identifier of the organization',
  })
  id: string;

  @ApiProperty({
    example: 'Songwriters United',
    description: 'The name of the organization',
  })
  name: string;

  @ApiProperty({
    example: 'A collective of talented songwriters',
    description: 'Description of the organization',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
