export type PaginationInput = {
  page?: number;
  limit?: number;
};

export interface CursorPaginationInput {
  limit?: number;
  cursor?: string;
}
