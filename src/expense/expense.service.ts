import { Injectable, Logger } from '@nestjs/common';
import { ParticipantTag, SplittingMethod } from '@prisma/client';

import { PrismaService } from '~/prisma/prisma.service';

import {
  CreateExpensePayload,
  GetExpensesByEventSlugRequest,
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort_by]: order_by },
      });

      return {
        data: expenses,
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
          expense_participants: { include: { participant: true } },
          payment_proofs: true,
        },
      });

      if (!expense) return null;

      return {
        ...expense,
        participants: expense.expense_participants.map((ep) => ({
          ...ep,
          name: ep.participant.name,
          slug: ep.participant.slug,
          participant: undefined,
        })),
        expense_participants: undefined,
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
      });

      return expense;
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
      this.logger.error(`Error to updateExpense: ${error}`);
      throw error;
    }
  }
}
