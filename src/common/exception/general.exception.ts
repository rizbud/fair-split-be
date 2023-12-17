import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../interface';

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
        message: HttpStatus[status],
      },
      data: {
        error_code: code,
        message: message ?? HttpStatus[status],
      },
    };

    super(response, status);
  }
}
