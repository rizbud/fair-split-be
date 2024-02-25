import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';
import { EventService } from '~/event/event.service';
import { FirebaseService } from '~/firebase/firebase.service';

import { ExpenseService } from './expense.service';
import {
  CreateExpensePayload,
  GetExpensesByEventSlugRequest,
  UpdateExpensePayload,
} from './expense.type';
import { ExpenseValidator } from './expense.validator';

@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly eventService: EventService,
    private readonly firebaseService: FirebaseService,
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

  @Patch('/:id')
  @UseInterceptors(BaseResponseInterceptor)
  async updateExpense(
    @Param('id') id: string,
    @Body() body?: UpdateExpensePayload,
  ) {
    this.logger.log(`updateExpense: ${id}`);

    const err = this.validator.validateUpdateExpensePayload(id, body);
    if (err) throw new GeneralException(400, err);

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      const updatedExpense = await this.expenseService.updateExpense(
        Number(id),
        body,
      );

      return updatedExpense;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to updateExpense: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }

  @Post('/:id/payment_proofs')
  @UseInterceptors(
    FilesInterceptor('payment_proofs', 10, {
      limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new GeneralException(400, 'Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
    BaseResponseInterceptor,
  )
  async uploadPaymentProofs(
    @Param('id') id: string,
    @UploadedFiles() payment_proofs: Array<Express.Multer.File>,
  ) {
    this.logger.log(`uploadPaymentProofs: ${id}`);

    if (!payment_proofs || payment_proofs.length === 0) {
      throw new GeneralException(400, 'Payment proofs is required');
    }

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      const uploadPromises = await Promise.allSettled(
        payment_proofs.map((file) =>
          this.firebaseService.uploadFile('expenses', file),
        ),
      ).then((results) =>
        results.map((result) => result.status === 'fulfilled' && result.value),
      );

      await this.expenseService.addPaymentProofs(Number(id), uploadPromises);

      const paymentProofs =
        await this.expenseService.getPaymentProofsByExpenseId(Number(id));

      return paymentProofs;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to uploadPaymentProofs: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }
}
