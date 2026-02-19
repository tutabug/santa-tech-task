import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CursorService } from './pagination.cursor';
import { DEFAULT_PAGE_LIMIT } from './pagination.constants';
import { PaginationCursor, PaginationQuery } from './pagination.types';

@Injectable()
export class CursorDecodePipe
  implements
    PipeTransform<{ cursor?: string; limit?: number }, PaginationQuery>
{
  constructor(private readonly cursorService: CursorService) {}

  transform(value: { cursor?: string; limit?: number }): PaginationQuery {
    const limit = value.limit != null ? Number(value.limit) : DEFAULT_PAGE_LIMIT;
    let cursor: PaginationCursor | undefined;

    if (value.cursor) {
      try {
        cursor = this.cursorService.decode(value.cursor);
      } catch {
        throw new BadRequestException('Invalid cursor');
      }
    }

    return { limit, cursor };
  }
}
