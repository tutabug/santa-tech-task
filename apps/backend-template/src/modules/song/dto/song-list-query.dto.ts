import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_PAGE_LIMIT } from '../../../common/pagination';

/**
 * Query DTO for listing songs with cursor-based pagination.
 * Optionally transformed by CursorDecodePipe into PaginationQuery.
 */
export class SongListQueryDto {
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
    description: 'Cursor for pagination (base64 encoded)',
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTAyLTE5VDE5OjMwOjE1LjY2NVoiLCJpZCI6InNvbmctMTIzIn0=',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
