import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { GeneralException } from '~/common/exception';
import { BaseResponseInterceptor } from '~/common/interceptors';

import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get(':slug')
  @UseInterceptors(BaseResponseInterceptor)
  async getEventBySlug(@Param('slug') slug: string) {
    try {
      const data = await this.eventService.getEventBySlug(slug);
      if (!data) throw new GeneralException(404, 'Event not found');

      return data;
    } catch (error) {
      console.log(error);
      if (error instanceof GeneralException) throw error;
      throw new GeneralException(500, error.message);
    }
  }
}
