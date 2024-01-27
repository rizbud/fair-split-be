export type PaginationInput = {
  page?: string;
  limit?: string;
  order_by?: 'asc' | 'desc';
};

export interface CursorPaginationInput {
  limit?: number;
  cursor?: string;
}
