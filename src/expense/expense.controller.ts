import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';

import { EventService } from '~/event/event.service';
import {
  CreateExpensePayload,
  GetExpensesByEventSlugRequest,
} from './expense.type';

import { ExpenseService } from './expense.service';
import { ExpenseValidator } from './expense.validator';

@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly eventService: EventService,
  ) {}

  private readonly logger = new Logger('ExpenseController');
  private readonly validator = new ExpenseValidator();

  @Get('/')
  @UseInterceptors(PaginatedResponseInterceptor)
  async getExpensesByEventSlug(@Query() query?: GetExpensesByEventSlugRequest) {
    this.logger.log(`getExpensesByEventSlug: ${query}`);

    const err = this.validator.validateGetExpensesQuery(query);
    if (err) throw new GeneralException(400, err);

    try {
      const event = await this.eventService.getEventBySlug(query.event_slug);
      if (!event) {
        throw new GeneralException(404, 'Event not found');
      }
      const expenses = await this.expenseService.getExpensesByEventSlug(query);

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
      const expenses = await this.expenseService.getExpenseById(Number(id));
      if (!expenses) {
        throw new GeneralException(404, 'Expense not found');
      }

      return expenses;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getExpenseById: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }

  @Post('/')
  @UseInterceptors(BaseResponseInterceptor)
  async createExpense(@Body() body?: CreateExpensePayload) {
    this.logger.log(`createExpense: ${JSON.stringify({ body })}`);

    let err = this.validator.validateCreateExpensePayload(body);
    if (err) throw new GeneralException(400, err);

    try {
      const event = await this.eventService.getEventById(body.event_id);
      if (!event) throw new GeneralException(404, 'Event not found');

      err = this.validator.validateCreateExpenseTotalAmount(body);
      if (err) throw new GeneralException(400, err);

      const expenses = await this.expenseService.createExpense(body);

      return expenses;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to createExpense: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }
}
