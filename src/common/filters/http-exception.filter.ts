import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { mapToSnakeCase } from '../utils';

import type { ErrorResponse } from '../interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionRes: any = exception.getResponse();
    const { error, message, response, data } = exceptionRes;

    const responseJson: ErrorResponse = {
      response: response ?? {
        code: status,
        message: error,
      },
      data: data ?? {
        errorCode: status,
        message,
      },
    };

    res.status(status).json(mapToSnakeCase(responseJson));
  }
}
