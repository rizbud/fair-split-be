import { Injectable, Logger } from '@nestjs/common';

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

    const dasherizedEvent = name
      .slice(0, 32)
      .trim()
      .toLowerCase()
      .replace(/\s/g, '-');
    const eventSlug = `${dasherizedEvent}-${randomString()}`;

    const dasherizedParticipang = creator_name
      .slice(0, 32)
      .trim()
      .toLowerCase()
      .replace(/\s/g, '-');
    const participantSlug = `${dasherizedParticipang}-${randomString()}`;

    try {
      const event = await this.prismaService.event.create({
        data: {
          name: name.trim(),
          slug: eventSlug,
          description: description?.trim(),
          start_date,
          end_date,
          EventParticipant: {
            create: {
              participant: {
                create: {
                  name: creator_name.trim(),
                  slug: participantSlug,
                },
              },
              is_event_creator: true,
            },
          },
        },
        include: { EventParticipant: { select: { participant: true } } },
      });

      return {
        event: {
          ...event,
          EventParticipant: undefined,
        },
        participant: event.EventParticipant.map(
          (eventParticipant) => eventParticipant.participant,
        )[0],
      };
    } catch (error) {
      this.logger.error(`Error to create event: ${error}`);
      throw error;
    }
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

  async getEventParticipantsBySlug(slug: string) {
    this.logger.log(`getEventParticipantsBySlug: ${slug}`);

    try {
      const eventParticipants =
        await this.prismaService.eventParticipant.findMany({
          where: { event: { slug } },
          select: { participant: true },
        });

      return eventParticipants.map(
        (eventParticipant) => eventParticipant.participant,
      );
    } catch (error) {
      this.logger.error(`Error to getEventParticipantsBySlug: ${error}`);
      throw error;
    }
  }
}
