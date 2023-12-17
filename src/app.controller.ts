import { Controller, Get, HttpStatus, Query } from '@nestjs/common';

import { AppService } from './app.service';

import { GeneralException } from './common/exception';
import type { ResponseData } from './common/interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ResponseData<string> {
    const hello = this.appService.getHello();

    return {
      response: {
        code: 200,
        message: 'OK',
      },
      data: hello,
    };
  }

  @Get('http-status')
  getHttpStatus(@Query() query): ResponseData<string> {
    const code = Number(query.code ?? 200);
    const errorCode = Number(query.error_code ?? code);
    const message = query.message;

    throw new GeneralException({
      status: code in HttpStatus ? code : 400,
      code: code < 400 ? undefined : errorCode,
      message,
    });
  }
}
