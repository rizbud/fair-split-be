import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BaseResponse,
  CursorPaginatedData,
  CursorPaginatedResponse,
  PaginatedData,
  PaginatedResponse,
} from '../interface';
import { mapToSnakeCase } from '../utils';

@Injectable()
export class BaseResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const code = context.switchToHttp().getResponse().statusCode;
        const message = getReasonPhrase(code);

        const response: BaseResponse<T> = {
          response: {
            code,
            message,
          },
          data,
        };

        return mapToSnakeCase(response);
      }),
    );
  }
}

@Injectable()
export class PaginatedResponseInterceptor<T>
  extends BaseResponseInterceptor<PaginatedData<T>>
  implements NestInterceptor<PaginatedData<T>, PaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<PaginatedData<T>>,
  ): Observable<PaginatedResponse<T>> {
    return super.intercept(context, next).pipe(
      map((data) => {
        const response = {
          response: data.response,
          ...data.data,
        };

        return mapToSnakeCase(response);
      }),
    );
  }
}

@Injectable()
export class CursorPaginatedResponseInterceptor<T>
  extends BaseResponseInterceptor<CursorPaginatedData<T>>
  implements
    NestInterceptor<CursorPaginatedData<T>, CursorPaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<CursorPaginatedData<T>>,
  ): Observable<CursorPaginatedResponse<T>> {
    return super.intercept(context, next).pipe(
      map((data) => {
        const response = {
          response: data.response,
          ...data.data,
        };

        return mapToSnakeCase(response);
      }),
    );
  }
}
