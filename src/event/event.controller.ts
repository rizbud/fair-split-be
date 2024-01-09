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
import { EventPayload } from './event.type';

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
      !name.trim() ||
      !start_date.trim() ||
      !end_date.trim() ||
      !creator_name.trim()
    ) {
      const missingFields = [];
      Object.entries({
        name,
        start_date,
        end_date,
        creator_name,
      }).forEach(([key, value]) => !value.trim() && missingFields.push(key));

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
      const data = await this.eventService.getEventBySlug(slug);
      if (!data) throw new GeneralException(404, 'Event not found');

      return data;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      this.logger.error(`Error to getEventBySlug: ${error}`);
      throw new GeneralException(500, error.message);
    }
  }
}
