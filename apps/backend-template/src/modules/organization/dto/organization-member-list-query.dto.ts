import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_PAGE_LIMIT } from '../../../common/pagination';

export class OrganizationMemberListQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items to return',
    maximum: MAX_PAGE_LIMIT,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Cursor for the next page (base64 encoded)',
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTAyLTE4VDE5OjMwOjE1LjY2NVoiLCJpZCI6Im1lbWJlci0xMjMifQ==',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
