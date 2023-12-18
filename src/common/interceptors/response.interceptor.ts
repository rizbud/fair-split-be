import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../interface';
import { mapToSnakeCase } from '../utils';

@Injectable()
export class ResponseInterceptor<T>
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

        return mapToSnakeCase({
          response: {
            code,
            message,
          },
          data,
        });
      }),
    );
  }
}
