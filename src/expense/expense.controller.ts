import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  ImageFilesInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';
import { EventService } from '~/event/event.service';
import { FirebaseService } from '~/firebase/firebase.service';

import { ExpenseService } from './expense.service';
import {
  CreateExpensePayload,
  GetExpensesByEventSlugRequest,
  GetParticipantsByExpenseIdRequest,
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

  @Get('/:id/participants')
  @UseInterceptors(PaginatedResponseInterceptor)
  async getParticipantsByExpenseId(
    @Param('id') id: string,
    @Query() query?: GetParticipantsByExpenseIdRequest,
  ) {
    this.logger.log(`getParticipantsByExpenseId: ${id}`);

    const err = this.validator.validateGetParticipantsByExpenseIdQuery(query);
    if (err) throw new GeneralException(400, err);

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      const participants = await this.expenseService.getParticipantsByExpenseId(
        Number(id),
        query,
      );

      return participants;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getParticipantsByExpenseId: ${error}`);
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

  @Post('/:id/pay')
  @UseInterceptors(
    ImageFilesInterceptor('payment_proofs'),
    BaseResponseInterceptor,
  )
  async payExpense(
    @Param('id') id: string,
    @Headers('participant_id') participant_id: string,
    @Body() body?: { amount: number },
    @UploadedFiles() payment_proofs?: Array<Express.Multer.File>,
  ) {
    this.logger.log(
      `payExpense: ${JSON.stringify({ id, participant_id, body })}`,
    );

    const err = this.validator.validatePayExpensePayload(
      participant_id,
      body?.amount,
      payment_proofs,
    );
    if (err) throw new GeneralException(err.status, err.message);

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      const expenseParticipant =
        await this.expenseService.checkParticipantExistence(
          Number(id),
          participant_id,
          body.amount,
        );
      if (!expenseParticipant)
        throw new GeneralException(
          404,
          'Participant not found or amount is greater than the remaining amount to pay',
        );

      const paymentProofs = await Promise.allSettled(
        payment_proofs.map((file) =>
          this.firebaseService.uploadFile('expense_participant', file),
        ),
      ).then((results) =>
        results.map((result) => result.status === 'fulfilled' && result.value),
      );

      const updatedParticipant = await this.expenseService.payExpense(
        expenseParticipant.id,
        { amount: body.amount, payment_proofs: paymentProofs },
      );

      return updatedParticipant;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to payExpense: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }

  @Delete('/:id')
  @UseInterceptors(BaseResponseInterceptor)
  async deleteExpense(@Param('id') id: string) {
    this.logger.log(`deleteExpense: ${id}`);

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      await Promise.allSettled([
        ...expense.payment_proofs.map((p) =>
          this.firebaseService.deleteFile(p.path),
        ),
        this.expenseService.deleteExpense(Number(id)),
      ]);

      return { message: 'Expense deleted' };
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to deleteExpense: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }

  @Post('/:id/payment_proofs')
  @UseInterceptors(
    ImageFilesInterceptor('payment_proofs'),
    BaseResponseInterceptor,
  )
  async uploadPaymentProofs(
    @Param('id') id: string,
    @UploadedFiles() payment_proofs: Array<Express.Multer.File>,
  ) {
    this.logger.log(`uploadPaymentProofs: ${id}`);

    const err = this.validator.validateAddPaymentProofsPayload(payment_proofs);
    if (err) throw new GeneralException(400, err);

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

  @Delete('/:id/payment_proofs')
  @UseInterceptors(BaseResponseInterceptor)
  async deletePaymentProof(
    @Param('id') id: string,
    @Body() body?: { payment_proofs_ids: Array<string> },
  ) {
    this.logger.log(`deletePaymentProof: ${JSON.stringify(body)}`);

    const err = this.validator.validateDeleteExpensePayload(
      body?.payment_proofs_ids,
    );
    if (err) throw new GeneralException(400, err);

    try {
      const expense = await this.expenseService.getExpenseById(Number(id));
      if (!expense) throw new GeneralException(404, 'Expense not found');

      const validPaymentProofs = expense.payment_proofs.filter((p) =>
        body.payment_proofs_ids.includes(String(p.id)),
      );
      if (!validPaymentProofs.length) {
        throw new GeneralException(400, 'payment_proofs_ids not found');
      }

      await Promise.allSettled([
        ...validPaymentProofs.map((paymentProof) =>
          this.firebaseService.deleteFile(paymentProof.path),
        ),
        this.expenseService.deletePaymentProofs(
          validPaymentProofs.map((p) => p.id),
        ),
      ]);

      return { message: 'Payment proofs deleted' };
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to deletePaymentProof: ${error}`);
      throw new GeneralException(500, 'Internal server error');
    }
  }
}
