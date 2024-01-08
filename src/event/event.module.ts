import { Module } from '@nestjs/common';

import { PrismaService } from '~/prisma/prisma.service';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [PrismaService, EventService],
})
export class EventModule {}
