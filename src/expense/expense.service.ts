import { Injectable, Logger } from '@nestjs/common';
import { ParticipantTag, SplittingMethod } from '@prisma/client';

import { PrismaService } from '~/prisma/prisma.service';

import {
  CreateExpensePayload,
  GetExpensesByEventSlugRequest,
  GetParticipantsByExpenseIdRequest,
  PayExpensePayload,
  UpdateExpensePayload,
} from './expense.type';

@Injectable()
export class ExpenseService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger('ExpenseService');

  async getExpensesByEventSlug(payload: GetExpensesByEventSlugRequest) {
    this.logger.log(`getExpensesByEventSlug: ${JSON.stringify(payload)}`);

    const { event_slug } = payload;
    const sort_by = payload.sort_by || 'created_at';
    const order_by = payload.order_by || 'desc';
    const page = Number(payload.page || 1);
    const limit = Number(payload.limit || 10);

    let totalData = 0;
    let totalPage = 1;

    try {
      totalData = await this.prismaService.expense.count({
        where: { event: { slug: event_slug } },
      });

      totalPage = Math.ceil(totalData / limit);
    } catch (error) {
      this.logger.error(
        `Error to getExpensesByEventSlug.countExpense: ${error}`,
      );
      throw error;
    }

    try {
      const expenses = await this.prismaService.expense.findMany({
        where: { event: { slug: event_slug } },
        include: {
          _count: { select: { expense_participants: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort_by]: order_by },
      });

      const expensesMap = expenses.map((expense) => ({
        ...expense,
        totalParticipants: expense._count.expense_participants,
        count: undefined,
      }));

      return {
        data: expensesMap,
        pagination: {
          page,
          limit,
          totalData,
          totalPage,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error to getExpensesByEventSlug.findManyExpense: ${error}`,
      );
      throw error;
    }
  }

  async getExpenseById(expenseId: number) {
    this.logger.log(`getExpenseById: ${expenseId}`);

    try {
      const expense = await this.prismaService.expense.findUnique({
        where: { id: expenseId },
        include: {
          _count: { select: { expense_participants: true } },
          payment_proofs: true,
        },
      });

      if (!expense) return null;

      return {
        ...expense,
        totalParticipants: expense._count.expense_participants,
        count: undefined,
      };
    } catch (error) {
      this.logger.error(`Error to getExpenseById.findUniqueExpense: ${error}`);
      throw error;
    }
  }

  async createExpense(payload: CreateExpensePayload) {
    this.logger.log(`createExpense: ${JSON.stringify(payload)}`);

    const {
      event_id,
      name,
      description,
      start_date,
      end_date,
      amount = 0,
      tax = 0,
      service_fee = 0,
      discount = 0,
      splitting_method,
      participants,
    } = payload;

    const totalAmount = amount + tax + service_fee - discount;
    const expenseParticipants = participants.filter(
      (p) => p.tag === ParticipantTag.PARTICIPANT,
    );

    const expenseParticipantsData = participants.map((participant) => {
      const isPayer = participant.tag === ParticipantTag.PAYER;
      let amountToPay = 0;

      switch (splitting_method) {
        case SplittingMethod.PERCENTAGE:
          amountToPay =
            (participant.amount_to_pay_percentage / 100) * totalAmount;
          break;
        case SplittingMethod.CUSTOM_AMOUNT:
          amountToPay = participant.amount_to_pay_nominal;
          break;
        default:
          amountToPay = totalAmount / expenseParticipants.length;
          break;
      }

      this.logger.log(JSON.stringify({ totalAmount, amountToPay, isPayer }));

      return {
        participant_id: participant.id,
        amount_to_pay: isPayer ? 0 : amountToPay,
        tag: participant.tag,
      };
    });

    try {
      const expense = await this.prismaService.expense.create({
        data: {
          name,
          description,
          start_date,
          end_date,
          amount,
          tax,
          service_fee,
          discount,
          splitting_method,
          event: { connect: { id: event_id } },
          expense_participants: {
            createMany: { data: expenseParticipantsData },
          },
        },
        include: {
          _count: { select: { expense_participants: true } },
        },
      });

      return {
        ...expense,
        totalParticipants: expense._count.expense_participants,
        count: undefined,
      };
    } catch (error) {
      this.logger.error(`Error to createExpense.createExpense: ${error}`);
      throw error;
    }
  }

  async updateExpense(expenseId: number, payload: UpdateExpensePayload) {
    this.logger.log(`updateExpense: ${expenseId}`);

    try {
      const expense = await this.prismaService.expense.update({
        where: { id: expenseId },
        data: payload,
      });

      return expense;
    } catch (error) {
      this.logger.error(`Error to updateExpense.updateExpense: ${error}`);
      throw error;
    }
  }

  async deleteExpense(expenseId: number) {
    this.logger.log(`deleteExpense: ${expenseId}`);

    try {
      return this.prismaService.expense.delete({ where: { id: expenseId } });
    } catch (error) {
      this.logger.error(`Error to deleteExpense.deleteExpense: ${error}`);
      throw error;
    }
  }

  async getParticipantsByExpenseId(
    expenseId: number,
    params: GetParticipantsByExpenseIdRequest,
  ) {
    this.logger.log(
      `getParticipantsByExpenseId: ${JSON.stringify({ expenseId, params })}`,
    );

    const sort_by = params.sort_by || 'name';
    const order_by = params.order_by || 'asc';
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);

    let totalData = 0;
    let totalPage = 1;

    try {
      totalData = await this.prismaService.expenseParticipant.count({
        where: { expense_id: expenseId },
      });

      totalPage = Math.ceil(totalData / limit);
    } catch (error) {
      this.logger.error(
        `Error to getParticipantsByExpenseId.countParticipants: ${error}`,
      );
      throw error;
    }

    try {
      const expenseParticipants =
        await this.prismaService.expenseParticipant.findMany({
          where: { expense_id: expenseId },
          include: {
            participant: { select: { name: true } },
            payment_proofs: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy:
            sort_by === 'name'
              ? { participant: { name: order_by } }
              : sort_by === 'created_at'
              ? [{ [sort_by]: order_by }, { id: order_by }]
              : [{ [sort_by]: order_by }, { participant: { name: 'asc' } }],
        });

      const participants = expenseParticipants.map((participant) => ({
        ...participant,
        ...participant.participant,
        participant: undefined,
        participant_id: undefined,
      }));

      return {
        data: participants,
        pagination: {
          page,
          limit,
          totalData,
          totalPage,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error to getParticipantsByExpenseId.findManyExpenseParticipants: ${error}`,
      );
      throw error;
    }
  }

  async checkParticipantExistence(
    expenseId: number,
    participantId: string,
    amount: number,
  ) {
    this.logger.log(`checkParticipantExistence: ${participantId}`);

    try {
      return this.prismaService.expenseParticipant.findFirst({
        where: {
          expense_id: expenseId,
          participant_id: participantId,
          amount_to_pay: { gte: amount },
        },
        select: { id: true },
      });
    } catch (error) {
      this.logger.error(
        `Error to checkParticipantExistence.findFirstExpenseParticipant: ${error}`,
      );
      throw error;
    }
  }

  async payExpense(id: number, payload: PayExpensePayload) {
    this.logger.log(`payExpense: ${JSON.stringify({ id, payload })}`);

    try {
      const pay = await this.prismaService.expenseParticipant.update({
        where: { id },
        data: {
          paid_amount: payload.amount,
          amount_to_pay: { decrement: payload.amount },
          paid_at: new Date().toISOString(),
          payment_proofs: {
            createMany: {
              data: payload.payment_proofs.map((path) => ({ path })),
            },
          },
        },
        include: {
          participant: { select: { name: true } },
          payment_proofs: true,
        },
      });

      return {
        ...pay,
        participant: undefined,
        participant_id: undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error to payExpense.updateExpenseParticipant: ${error}`,
      );
      throw error;
    }
  }

  async getPaymentProofsByExpenseId(expenseId: number) {
    this.logger.log(`getPaymentProofs: ${expenseId}`);

    try {
      return this.prismaService.paymentProof.findMany({
        where: { expense_id: expenseId },
      });
    } catch (error) {
      this.logger.error(
        `Error to getPaymentProofs.findManyPaymentProofs: ${error}`,
      );
      throw error;
    }
  }

  async addPaymentProofs(expenseId: number, paymentProofs: Array<string>) {
    this.logger.log(`addPaymentProofs: ${expenseId}`);

    try {
      return this.prismaService.paymentProof.createMany({
        data: paymentProofs.map((path) => ({
          path,
          expense_id: expenseId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error(
        `Error to addPaymentProofs.createManyPaymentProofs: ${error}`,
      );
      throw error;
    }
  }

  async deletePaymentProofs(paymentProofIds: Array<string>) {
    this.logger.log(`deletePaymentProofs: ${paymentProofIds}`);

    try {
      return this.prismaService.paymentProof.deleteMany({
        where: { id: { in: paymentProofIds } },
      });
    } catch (error) {
      this.logger.error(
        `Error to deletePaymentProofs.deleteManyPaymentProofs: ${error}`,
      );
      throw error;
    }
  }
}
