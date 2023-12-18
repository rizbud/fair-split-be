type Data = Record<string, any>;

interface ErrorData {
  errorCode: number; // Custom Error Code or HTTP Status Code
  message: string; // Custom Error Message or HTTP Status Message
}

interface BaseResponse<T = Data> {
  response: {
    code: number; // HTTP Status Code
    message: string; // HTTP Status Message
  };
  data: T; // Response Data
}

export type ErrorResponse = BaseResponse<ErrorData>;

export interface PaginatedResponse<T = Data>
  extends BaseResponse<ReadonlyArray<T>> {
  pagination: {
    page: number;
    limit: number;
    totalPage: number;
    totalData: number;
  };
}

export type ResponseData<T = Data> = BaseResponse<T> | ErrorResponse;

export type ResponsePagination<T = Data> = PaginatedResponse<T> | ErrorResponse;
