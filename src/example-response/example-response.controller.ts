import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  CursorPaginatedResponseInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';
import type {
  CursorPaginatedData,
  CursorPaginationInput,
  PaginatedData,
  PaginationInput,
} from '~/common/interface';

@Controller('example-response')
export class ExampleResponseController {
  @Get()
  @UseInterceptors(BaseResponseInterceptor)
  getHello(@Query() query?: Record<string, string>): Record<string, string> {
    const isError = query?.error;
    if (isError === 'true') throw new GeneralException();

    return { message: 'Fair Split API Example Response' };
  }

  @Get('pagination')
  @UseInterceptors(PaginatedResponseInterceptor)
  getPagination(@Query() query?: PaginationInput): PaginatedData {
    const { page = 1, limit = 10 } = query ?? {};

    return {
      data: [
        {
          id: 1,
          name: 'John Doe',
        },
        {
          id: 2,
          name: 'Jane Doe',
        },
      ],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalData: 100,
        totalPage: 10,
      },
    };
  }

  @Get('cursor-pagination')
  @UseInterceptors(CursorPaginatedResponseInterceptor)
  getCursorPagination(
    @Query() query?: CursorPaginationInput,
  ): CursorPaginatedData {
    const { limit = 10 } = query ?? {};

    return {
      data: [
        {
          id: 1,
          name: 'John Doe',
        },
        {
          id: 2,
          name: 'Jane Doe',
        },
      ],
      pagination: {
        limit,
        nextCursor: 'eyJpZCI6MX0=',
        prevCursor: null,
      },
    };
  }
}
