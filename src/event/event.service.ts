import { Injectable, Logger } from '@nestjs/common';

import type { Event, Participant } from '@prisma/client';

import { randomString } from '~/common/utils';
import { PrismaService } from '~/prisma/prisma.service';

import { EventPayload } from './event.type';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger('EventService');

  async createEvent(payload: EventPayload) {
    this.logger.log(`createEvent: ${JSON.stringify(payload)}`);

    const { name, description, start_date, end_date, creator_name } = payload;

    let isEventSlugExist = true;
    let eventSlug = '';

    while (isEventSlugExist) {
      const dasherized = name.slice(0, 32).toLowerCase().replace(/\s/g, '-');
      const tempSlug = `${dasherized}-${randomString()}`;

      try {
        const event = await this.prismaService.event.findUnique({
          where: { slug: tempSlug },
          select: { id: true },
        });

        if (!event) {
          isEventSlugExist = false;
          eventSlug = tempSlug;
        }
      } catch (error) {
        isEventSlugExist = false;
        this.logger.error(`Error to check isEventSlugExist: ${error}`);
        throw error;
      }
    }

    let isParticipantSlugExist = true;
    let participantSlug = '';

    while (isParticipantSlugExist) {
      const dasherized = creator_name
        .slice(0, 32)
        .toLowerCase()
        .replace(/\s/g, '-');
      const tempSlug = `${dasherized}-${randomString()}`;

      try {
        const participant = await this.prismaService.participant.findUnique({
          where: { slug: tempSlug },
          select: { id: true },
        });

        if (!participant) {
          isParticipantSlugExist = false;
          participantSlug = tempSlug;
        }
      } catch (error) {
        isParticipantSlugExist = false;
        this.logger.error(`Error to check isParticipantSlugExist: ${error}`);
        throw error;
      }
    }

    let event: Event;
    try {
      event = await this.prismaService.event.create({
        data: {
          name,
          slug: eventSlug,
          description,
          start_date,
          end_date,
          EventParticipant: {
            create: {
              participant: {
                create: {
                  name: creator_name,
                  slug: participantSlug,
                },
              },
              is_event_creator: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error to create event: ${error}`);
      throw error;
    }

    let participant: Participant;
    try {
      participant = await this.prismaService.participant.findUnique({
        where: { slug: participantSlug },
      });
    } catch (error) {
      this.logger.error(`Error to get participant: ${error}`);
      throw error;
    }

    return {
      event,
      participant,
    };
  }

  async getEventBySlug(slug: string) {
    this.logger.log(`getEventBySlug: ${slug}`);

    try {
      const event = await this.prismaService.event.findUnique({
        where: { slug },
      });

      return event;
    } catch (error) {
      this.logger.error(`Error to getEventBySlug: ${error}`);
      throw error;
    }
  }
}
