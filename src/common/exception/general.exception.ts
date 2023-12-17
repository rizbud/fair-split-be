import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../interface';
import { getReasonPhrase } from 'http-status-codes';

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
        error_code: code,
        message: message ?? getReasonPhrase(status),
      },
    };

    super(response, status);
  }
}
