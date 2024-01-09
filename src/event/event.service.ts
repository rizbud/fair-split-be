import { Injectable } from '@nestjs/common';

import type { Event, Participant } from '@prisma/client';

import { PrismaService } from '~/prisma/prisma.service';
import { mapToCamelCase, randomString } from '~/common/utils';

import { EventPayload } from './event.type';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(payload: EventPayload) {
    const { name, description, startDate, endDate, creatorName } =
      mapToCamelCase(payload);

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
        throw error;
      }
    }

    let isParticipantSlugExist = true;
    let participantSlug = '';

    while (isParticipantSlugExist) {
      const dasherized = creatorName
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
          start_date: startDate,
          end_date: endDate,
          EventParticipant: {
            create: {
              participant: {
                create: {
                  name: creatorName,
                  slug: participantSlug,
                },
              },
              is_event_creator: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }

    let participant: Participant;
    try {
      participant = await this.prismaService.participant.findUnique({
        where: { slug: participantSlug },
      });
    } catch (error) {
      throw error;
    }
    return {
      event,
      participant,
    };
  }

  getEventBySlug(slug: string) {
    return this.prismaService.event.findUnique({ where: { slug } });
  }
}
