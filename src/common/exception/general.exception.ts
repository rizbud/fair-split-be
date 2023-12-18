import { HttpException, HttpStatus } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';

import type { ErrorResponse } from '../interface';

export class GeneralException extends HttpException {
  constructor(
    status = HttpStatus.BAD_REQUEST,
    message?: string,
    code?: number,
  ) {
    const response: ErrorResponse = {
      response: {
        code: status,
        message: getReasonPhrase(status),
      },
      data: {
        errorCode: code ?? status,
        message: message ?? getReasonPhrase(status),
      },
    };

    super(response, status);
  }
}
