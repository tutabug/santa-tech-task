import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export const ApiPaginatedResponse = <T extends Type>(itemType: T) =>
  applyDecorators(
    ApiExtraModels(PaginationMetaDto, itemType),
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
