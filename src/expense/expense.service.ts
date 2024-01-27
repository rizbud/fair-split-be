import { Injectable, Logger } from '@nestjs/common';
import { Event } from '@prisma/client';

import { PrismaService } from '~/prisma/prisma.service';

import { GetExpensesByEventSlugRequest } from './expense.type';

@Injectable()
export class ExpenseService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger('ExpenseService');

  async getExpensesByEventSlug(payload: GetExpensesByEventSlugRequest) {
    this.logger.log(`getExpensesByEventSlug: ${JSON.stringify(payload)}`);

    const { event_slug, order_by = 'desc', sort_by = 'created_at' } = payload;
    const page = Number(payload.page || 1);
    const limit = Number(payload.limit || 10);

    let event: Event | null = null;
    try {
      event = await this.prismaService.event.findUnique({
        where: { slug: event_slug },
      });
    } catch (error) {
      this.logger.error(
        `Error to getExpensesByEventSlug.findUniqueEvent: ${error}`,
      );
      throw error;
    }

    if (!event) return null;

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
          participant_id: undefined,
          participant: undefined,
        })),
        expense_participants: undefined,
      };
    } catch (error) {
      this.logger.error(`Error to getExpenseById.findUniqueExpense: ${error}`);
      throw error;
    }
  }
}
