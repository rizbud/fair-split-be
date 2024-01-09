import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import validator from 'validator';

import { GeneralException } from '~/common/exception';
import { BaseResponseInterceptor } from '~/common/interceptors';

import { EventService } from './event.service';
import { EventPayload, ParticipateEventPayload } from './event.type';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  private readonly logger = new Logger('EventController');

  @Post()
  @UseInterceptors(BaseResponseInterceptor)
  async createEvent(@Body() body: EventPayload) {
    const { name, start_date, end_date, creator_name } = body;

    this.logger.log(`createEvent: ${JSON.stringify(body)}`);

    if (
      !name?.trim() ||
      !start_date?.trim() ||
      !end_date?.trim() ||
      !creator_name?.trim()
    ) {
      const missingFields = [];
      Object.entries({
        name,
        start_date,
        end_date,
        creator_name,
      }).forEach(([key, value]) => !value?.trim() && missingFields.push(key));

      throw new GeneralException(
        400,
        `Missing required fields (${missingFields.join(', ')})`,
      );
    }

    if (!validator.isRFC3339(start_date) || !validator.isRFC3339(end_date)) {
      throw new GeneralException(
        400,
        'Date must be in RFC3339 format (YYYY-MM-DDTHH:mm:ssZ)',
      );
    }

    if (validator.isAfter(start_date, end_date)) {
      throw new GeneralException(400, 'Start date cannot be after end date');
    }

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

  @Get(':slug/participants')
  @UseInterceptors(BaseResponseInterceptor)
  async getEventParticipantsBySlug(@Param('slug') slug: string) {
    this.logger.log(`getEventParticipantsBySlug: ${slug}`);

    try {
      const participants = await this.eventService.getEventParticipantsBySlug(
        slug,
      );
      if (!participants.length)
        throw new GeneralException(404, 'Event not found');

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
