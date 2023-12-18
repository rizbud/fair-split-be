import { HttpException, HttpStatus } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';

import { mapToSnakeCase } from '../utils';

import type { ErrorResponse } from '../interface';

interface GeneralExceptionInput {
  status: HttpStatus | number;
  code?: number;
  message?: string;
}

export class GeneralException extends HttpException {
  constructor({ status, message, code }: GeneralExceptionInput) {
    const response: ErrorResponse = {
      response: {
        code: status,
        message: getReasonPhrase(status),
      },
      data: {
        errorCode: code,
        message: message ?? getReasonPhrase(status),
      },
    };

    super(mapToSnakeCase(response), status);
  }
}
