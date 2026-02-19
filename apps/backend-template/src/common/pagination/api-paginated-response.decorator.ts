import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './pagination.constants';

export const ApiPaginatedResponse = <T extends Type>(itemType: T) =>
  applyDecorators(
    ApiExtraModels(PaginationMetaDto, itemType),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: `Number of items to return (default: ${DEFAULT_PAGE_LIMIT}, max: ${MAX_PAGE_LIMIT})`,
      example: DEFAULT_PAGE_LIMIT,
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description:
        'Opaque cursor for fetching the next page. Use the value of `nextCursor` from the previous response.',
    }),
    ApiOkResponse({
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(itemType) },
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              correlationId: { type: 'string', format: 'uuid' },
              pagination: { $ref: getSchemaPath(PaginationMetaDto) },
            },
          },
        },
      },
    }),
  );
