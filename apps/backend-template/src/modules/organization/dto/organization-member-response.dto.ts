import { ApiProperty } from '@nestjs/swagger';
import { OrganizationMember, OrganizationRole } from '../domain';

/**
 * Response DTO for OrganizationMember - used at the presentation layer boundary.
 * Maps OrganizationMember aggregate to API response format.
 */
export class OrganizationMemberResponseDto {
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
    example: 'MANAGER',
    description: 'The role of the member in the organization',
    enum: OrganizationRole,
  })
  role: OrganizationRole;

  @ApiProperty({
    description: 'When the user joined the organization',
  })
  joinedAt: Date;

  /**
   * Maps an OrganizationMember aggregate to a response DTO.
   * This static method is the boundary mapper from domain to presentation.
   */
  static fromAggregate(
    member: OrganizationMember,
  ): OrganizationMemberResponseDto {
    const dto = new OrganizationMemberResponseDto();
    dto.id = member.id;
    dto.organizationId = member.organizationId;
    dto.userId = member.userId;
    dto.role = member.role;
    dto.joinedAt = member.joinedAt;
    return dto;
  }
}
