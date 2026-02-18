import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationMeta } from '../pagination';

export interface Response<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    correlationId: string;
    pagination?: PaginationMeta;
  };
}

type ResponseData<T> = T extends PaginatedResult<infer U> ? U[] : T;

const isPaginatedResult = (data: unknown): data is PaginatedResult<unknown> => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'pagination' in data
  );
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<ResponseData<T>>>
{
  constructor(private readonly cls: ClsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<ResponseData<T>>> {
    return next.handle().pipe(
      map((data): Response<ResponseData<T>> => {
        const meta = {
          timestamp: new Date().toISOString(),
          correlationId: this.cls.getId(),
        };

        if (isPaginatedResult(data)) {
          return {
            success: true,
            data: data.items as ResponseData<T>,
            meta: {
              ...meta,
              pagination: data.pagination,
            },
          };
        }

        return {
          success: true,
          data: data as ResponseData<T>,
          meta,
        };
      }),
    );
  }
}
