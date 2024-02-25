import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import {
  BaseResponseInterceptor,
  PaginatedResponseInterceptor,
} from '~/common/interceptors';

import { EventService } from './event.service';
import {
  CreateEventPayload,
  GetEventParticipantsRequest,
  ParticipateEventPayload,
} from './event.type';
import { EventValidator } from './event.validator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  private readonly logger = new Logger('EventController');
  private readonly validator = new EventValidator();

  @Post()
  @UseInterceptors(BaseResponseInterceptor)
  async createEvent(@Body() body: CreateEventPayload) {
    this.logger.log(`createEvent: ${JSON.stringify(body)}`);

    const err = this.validator.validateCreateEventPayload(body);
    if (err) throw new GeneralException(400, err);

    try {
      const event = await this.eventService.createEvent(body);
      return event;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to createEvent: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }

  @Get(':slug')
  @UseInterceptors(BaseResponseInterceptor)
  async getEventBySlug(@Param('slug') slug: string) {
    this.logger.log(`getEventBySlug: ${slug}`);

    try {
      const event = await this.eventService.getEventBySlug(slug);
      if (!event) throw new GeneralException(404, 'Event not found');

      return event;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getEventBySlug: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }

  @Patch(':id')
  @UseInterceptors(BaseResponseInterceptor)
  async updateEventById(
    @Param('id') id: string,
    @Body() body: CreateEventPayload,
  ) {
    this.logger.log(`updateEventById: ${JSON.stringify({ id, body })}`);

    const err = this.validator.validateUpdateEventPayload(id, body);
    if (err) throw new GeneralException(400, err);

    try {
      const event = await this.eventService.getEventById(Number(id));
      if (!event) throw new GeneralException(404, 'Event not found');

      const updatedEvent = await this.eventService.updateEventById(
        Number(id),
        body,
      );

      return updatedEvent;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to updateEventById: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }

  @Get(':slug/participants')
  @UseInterceptors(PaginatedResponseInterceptor)
  async getEventParticipantsBySlug(
    @Param('slug') slug: string,
    @Query() query: GetEventParticipantsRequest,
  ) {
    this.logger.log(`getEventParticipantsBySlug: ${slug}`);

    try {
      const event = await this.eventService.getEventBySlug(slug);
      if (!event) throw new GeneralException(404, 'Event not found');

      const participants = await this.eventService.getEventParticipantsBySlug(
        slug,
        query,
      );

      return participants;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getEventParticipantsBySlug: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }

  @Post(':slug/participate')
  @UseInterceptors(BaseResponseInterceptor)
  async participateEvent(
    @Param('slug') slug: string,
    @Body() body: ParticipateEventPayload,
  ) {
    this.logger.log(`participateEvent: ${JSON.stringify({ slug, body })}`);

    const { participant_name } = body || {};

    if (!participant_name?.trim()) {
      throw new GeneralException(
        400,
        'Missing required field (participant_name)',
      );
    }

    try {
      const participant = await this.eventService.participateEvent(
        slug,
        participant_name,
      );
      if (!participant) throw new GeneralException(404, 'Event not found');

      return participant;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to participateEvent: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }
}
