import { Controller, Get, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { GeneralException } from './common/exception';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() query?: Record<string, string>): Record<string, string> {
    const isError = query?.error;
    if (isError === 'true') throw new GeneralException();

    const hello = this.appService.getHello();

    return {
      message: hello,
    };
  }
}
