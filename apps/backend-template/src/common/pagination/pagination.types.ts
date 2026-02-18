export type PaginationMeta = {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type PaginationCursor = {
  createdAt: Date;
  id: string;
};

export type PaginationQuery = {
  limit: number;
  cursor?: PaginationCursor | null;
};
