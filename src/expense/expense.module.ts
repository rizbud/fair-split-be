import { Module } from '@nestjs/common';

import { PrismaService } from '~/prisma/prisma.service';
import { EventService } from '~/event/event.service';

import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  controllers: [ExpenseController],
  providers: [PrismaService, ExpenseService, EventService],
})
export class ExpenseModule {}
