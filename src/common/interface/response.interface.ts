type Data = Record<string, any>;

interface ErrorData {
  errorCode: number; // Custom Error Code or HTTP Status Code
  message: string; // Custom Error Message or HTTP Status Message
}

export interface Pagination {
  page: number;
  limit: number;
  totalPage?: number;
  totalData?: number;
}

export interface CursorPagination {
  limit: number;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PaginatedData<T = Data> {
  data: ReadonlyArray<T>;
  pagination: Pagination;
}

export interface CursorPaginatedData<T = Data> {
  data: ReadonlyArray<T>;
  pagination: CursorPagination;
}

export interface BaseResponse<T = Data> {
  response: {
    code: number; // HTTP Status Code
    message: string; // HTTP Status Message
  };
  data: T; // Response Data
}

export type ErrorResponse = BaseResponse<ErrorData>;

export interface PaginatedResponse<T = Data>
  extends BaseResponse<PaginatedData<T>> {
  pagination?: Pagination;
}

export interface CursorPaginatedResponse<T = Data>
  extends BaseResponse<CursorPaginatedData<T>> {
  pagination?: CursorPagination;
}
