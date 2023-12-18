import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';

import { GeneralException } from './common/exception';
import { BaseResponseInterceptor } from './common/interceptors';

@Controller()
export class AppController {
  @Get()
  @UseInterceptors(BaseResponseInterceptor)
  getHello(@Query() query?: Record<string, string>): Record<string, string> {
    const isError = query?.error;
    if (isError === 'true') throw new GeneralException();

    return { message: 'Fair Split API' };
  }
}
