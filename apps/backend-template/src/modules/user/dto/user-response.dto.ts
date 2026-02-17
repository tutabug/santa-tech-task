import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for User - used at the presentation layer boundary.
 * Maps aggregate data to API response format.
 */
export class UserResponseDto {
  @ApiProperty({
    example: 'ckz1234567890',
    description: 'The unique identifier of the user',
  })
  id: string;

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

  @ApiProperty({ example: false, description: 'Whether the email is verified' })
  emailVerified: boolean;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'The avatar URL',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  /**
   * Maps a User aggregate to a response DTO.
   * This static method is the boundary mapper from domain to presentation.
   */
  static fromAggregate(user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.emailVerified = user.emailVerified;
    dto.image = user.image;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
