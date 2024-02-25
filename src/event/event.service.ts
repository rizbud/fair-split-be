import { Injectable, Logger } from '@nestjs/common';

import { toSlug } from '~/common/utils';
import { PrismaService } from '~/prisma/prisma.service';

import { CreateEventPayload, UpdateEventPayload } from './event.type';
import { Event } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger('EventService');

  async createEvent(payload: CreateEventPayload) {
    this.logger.log(`createEvent: ${JSON.stringify(payload)}`);

    const { name, description, start_date, end_date, creator_name } = payload;

    const eventSlug = toSlug(name);
    const participantSlug = toSlug(creator_name);

    try {
      const event = await this.prismaService.event.create({
        data: {
          name: name.trim(),
          slug: eventSlug,
          description: description?.trim(),
          start_date,
          end_date,
          event_participants: {
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
        include: {
          event_participants: {
            select: { participant: true },
          },
        },
      });

      return {
        event: {
          ...event,
          EventParticipant: undefined,
        },
        participant: event.event_participants.map((eventParticipant) => ({
          ...eventParticipant.participant,
          is_event_creator: true,
        }))[0],
      };
    } catch (error) {
      this.logger.error(`Error to createEvent.createEvent: ${error}`);
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
      this.logger.error(`Error to getEventBySlug.findUniqueEvent: ${error}`);
      throw error;
    }
  }

  async getEventParticipantsBySlug(slug: string) {
    this.logger.log(`getEventParticipantsBySlug: ${slug}`);

    try {
      const eventParticipants =
        await this.prismaService.eventParticipant.findMany({
          where: { event: { slug } },
          select: { participant: true, is_event_creator: true },
        });

      return eventParticipants.map((eventParticipant) => ({
        ...eventParticipant.participant,
        is_event_creator: eventParticipant.is_event_creator,
      }));
    } catch (error) {
      this.logger.error(
        `Error to getEventParticipantsBySlug.findEventParticipants: ${error}`,
      );
      throw error;
    }
  }

  async participateEvent(slug: string, name: string) {
    this.logger.log(`participateEvent: ${JSON.stringify({ slug, name })}`);

    let event: Event | null = null;
    try {
      event = await this.prismaService.event.findUnique({
        where: { slug },
      });
    } catch (error) {
      this.logger.error(`Error to participateEvent.findUniqueEvent: ${error}`);
      throw error;
    }

    if (!event) return null;

    try {
      const participantSlug = toSlug(name);

      const participant = await this.prismaService.participant.create({
        data: {
          name: name.trim(),
          slug: participantSlug,
          event_participants: {
            create: { event: { connect: { id: event.id } } },
          },
        },
      });

      return {
        ...participant,
        is_event_creator: false,
      };
    } catch (error) {
      this.logger.error(
        `Error to participateEvent.createParticipant: ${error}`,
      );
      throw error;
    }
  }

  async getEventById(id: number) {
    this.logger.log(`getEventById: ${id}`);

    try {
      const event = await this.prismaService.event.findUnique({
        where: { id },
      });

      return event;
    } catch (error) {
      this.logger.error(`Error to getEventById.findUniqueEvent: ${error}`);
      throw error;
    }
  }
  async updateEventById(id: number, payload: UpdateEventPayload) {
    this.logger.log(`updateEventById: ${JSON.stringify({ id, payload })}`);

    try {
      const event = await this.prismaService.event.update({
        where: { id },
        data: payload,
      });

      return event;
    } catch (error) {
      this.logger.error(`Error to updateEventById.updateEvent: ${error}`);
      throw error;
    }
  }
}
