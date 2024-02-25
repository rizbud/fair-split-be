import { Module } from '@nestjs/common';

import { EventService } from '~/event/event.service';
import { FirebaseService } from '~/firebase/firebase.service';
import { PrismaService } from '~/prisma/prisma.service';

import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  controllers: [ExpenseController],
  providers: [PrismaService, ExpenseService, EventService, FirebaseService],
})
export class ExpenseModule {}
