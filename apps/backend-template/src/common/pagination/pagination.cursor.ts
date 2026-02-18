import { Injectable } from '@nestjs/common';
import { PaginationCursor } from './pagination.types';

type CursorPayload = {
  createdAt: string;
  id: string;
};

@Injectable()
export class CursorService {
  encode(cursor: PaginationCursor): string {
    const payload: CursorPayload = {
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    };

    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  }

  decode(cursor: string): PaginationCursor {
    let payload: CursorPayload;

    try {
      const raw = Buffer.from(cursor, 'base64').toString('utf8');
      payload = JSON.parse(raw) as CursorPayload;
    } catch {
      throw new Error('Invalid cursor');
    }

    if (
      !payload ||
      typeof payload.createdAt !== 'string' ||
      typeof payload.id !== 'string'
    ) {
      throw new Error('Invalid cursor');
    }

    const createdAt = new Date(payload.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error('Invalid cursor');
    }

    return {
      createdAt,
      id: payload.id,
    };
  }
}
