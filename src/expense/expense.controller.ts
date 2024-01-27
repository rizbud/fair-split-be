import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';

import { ExpenseService } from './expense.service';
import { GetExpensesByEventSlugRequest } from './expense.type';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly eventService: ExpenseService) {}

  private readonly logger = new Logger('ExpenseController');

  @Get('/')
  @UseInterceptors(PaginatedResponseInterceptor)
  async getExpensesByEventSlug(@Query() query?: GetExpensesByEventSlugRequest) {
    this.logger.log(`getExpensesByEventSlug: ${query}`);

    if (!query?.event_slug) {
      throw new GeneralException(
        400,
        'Missing event_slug query parameter in request',
      );
    }

    if (query?.order_by && !['asc', 'desc'].includes(query.order_by)) {
      throw new GeneralException(
        400,
        'Invalid order_by query parameter in request',
      );
    }

    if (
      query?.sort_by &&
      !['created_at', 'name', 'start_date', 'end_date'].includes(query.sort_by)
    ) {
      throw new GeneralException(
        400,
        'Invalid sort_by query parameter in request',
      );
    }

    try {
      const expenses = await this.eventService.getExpensesByEventSlug(query);
      if (!expenses) {
        throw new GeneralException(404, 'Event not found');
      }

      return expenses;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getExpensesByEventSlug: ${error}`);
      throw error;
    }
  }

  @Get('/:id')
  @UseInterceptors(BaseResponseInterceptor)
  async getExpenseById(@Param('id') id: string) {
    this.logger.log(`getExpenseById: ${id}`);

    try {
      const expenses = await this.eventService.getExpenseById(Number(id));
      if (!expenses) {
        throw new GeneralException(404, 'Expense not found');
      }

      return expenses;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getExpenseById: ${error}`);
      throw error;
    }
  }
}
