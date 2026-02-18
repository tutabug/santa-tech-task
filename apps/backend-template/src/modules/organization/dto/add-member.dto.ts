import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { OrganizationRole } from '../domain';

/**
 * Input DTO for adding a member to an organization.
 * Validates and transforms HTTP request body data.
 */
export class AddMemberDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'The UUID of the user to add to the organization',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'MANAGER',
    description: 'The role of the member in the organization',
    enum: OrganizationRole,
  })
  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
