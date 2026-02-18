import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../domain';

/**
 * Response DTO for Organization - used at the presentation layer boundary.
 * Maps Organization aggregate to API response format.
 */
export class OrganizationResponseDto {
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

  /**
   * Maps an Organization aggregate to a response DTO.
   * This static method is the boundary mapper from domain to presentation.
   */
  static fromAggregate(organization: Organization): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    dto.id = organization.id;
    dto.name = organization.name;
    dto.description = organization.description;
    dto.createdAt = organization.createdAt;
    dto.updatedAt = organization.updatedAt;
    return dto;
  }
}
