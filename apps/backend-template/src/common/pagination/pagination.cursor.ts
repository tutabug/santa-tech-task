import { PaginationCursor } from './pagination.types';

export type PaginationCursorPayload = {
  createdAt: string;
  id: string;
};

export const encodeCursor = (cursor: PaginationCursor): string => {
  const payload: PaginationCursorPayload = {
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id,
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
};

export const decodeCursor = (cursor: string): PaginationCursor => {
  let payload: PaginationCursorPayload;

  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    payload = JSON.parse(raw) as PaginationCursorPayload;
  } catch {
    throw new Error('Invalid cursor');
  }

  if (!payload || typeof payload.createdAt !== 'string' || typeof payload.id !== 'string') {
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
};
