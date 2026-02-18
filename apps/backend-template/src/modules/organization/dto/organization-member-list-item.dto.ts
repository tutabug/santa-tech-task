import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '../domain';

/**
 * Read-model DTO for organization member list items.
 * Returned by query use cases to avoid aggregate mapping.
 */
export class OrganizationMemberListItemDto {
  @ApiProperty({
    example: 'member-uuid-here',
    description: 'The unique identifier of the membership',
  })
  id: string;

  @ApiProperty({
    example: 'org-uuid-here',
    description: 'The organization ID',
  })
  organizationId: string;

  @ApiProperty({
    example: 'user-uuid-here',
    description: 'The user ID',
  })
  userId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    example: 'MANAGER',
    description: 'The role of the member in the organization',
    enum: OrganizationRole,
  })
  role: OrganizationRole;

  @ApiProperty({
    description: 'When the user joined the organization',
  })
  joinedAt: Date;
}
