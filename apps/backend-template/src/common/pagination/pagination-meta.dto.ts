import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from './pagination.types';

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({
    description: 'Limit applied to this page',
    example: 100,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there is another page after this one',
    example: false,
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Cursor for the next page (base64 encoded)',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTAyLTE4VDE5OjMwOjE1LjY2NVoiLCJpZCI6Im9yZy0xMjMifQ==',
  })
  nextCursor: string | null;
}
