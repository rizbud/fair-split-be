import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import validator from 'validator';

import { GeneralException } from '~/common/exception';
import { BaseResponseInterceptor } from '~/common/interceptors';
import { mapToCamelCase } from '~/common/utils';

import { EventService } from './event.service';
import { EventPayload } from './event.type';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseInterceptors(BaseResponseInterceptor)
  async createEvent(@Body() body: EventPayload) {
    const { name, startDate, endDate, creatorName } = mapToCamelCase(body);

    if (!name || !startDate || !endDate || !creatorName) {
      throw new GeneralException(400, 'Missing required fields');
    }

    if (!validator.isRFC3339(startDate) || !validator.isRFC3339(endDate)) {
      throw new GeneralException(
        400,
        'Date format must be in RFC3339 (YYYY-MM-DDTHH:mm:ssZ)',
      );
    }

    if (validator.isAfter(startDate, endDate)) {
      throw new GeneralException(400, 'Start date must be before end date');
    }

    try {
      return this.eventService.createEvent(body);
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      throw new GeneralException(500, error.message);
    }
  }

  @Get(':slug')
  @UseInterceptors(BaseResponseInterceptor)
  async getEventBySlug(@Param('slug') slug: string) {
    try {
      const data = await this.eventService.getEventBySlug(slug);
      if (!data) throw new GeneralException(404, 'Event not found');

      return data;
    } catch (error) {
      if (error instanceof GeneralException) throw error;
      throw new GeneralException(500, error.message);
    }
  }
}
