import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OrganizationRole } from '../domain';

/**
 * Input DTO for adding a member to an organization.
 * Validates and transforms HTTP request body data.
 */
export class AddMemberDto {
  @ApiProperty({
    example: 'songwriter@example.com',
    description: 'The email of the user to add to the organization',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SONGWRITER',
    description: 'The role of the member in the organization',
    enum: OrganizationRole,
  })
  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
