import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '~/prisma/prisma.service';

import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService, PrismaService],
    }).compile();

    service = module.get<EventService>(EventService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const payload = {
    name: 'Test Event',
    description: 'This is a test event',
    start_date: '2023-12-31T23:59:00Z',
    end_date: '2024-01-01T00:00:00Z',
    creator_name: 'John Doe',
  };

  const event = {
    id: 1,
    slug: 'test-event',
    name: payload.name,
    description: payload.description,
    start_date: payload.start_date,
    end_date: payload.end_date,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
  const participant = {
    id: '1',
    name: payload.creator_name,
    slug: 'john-doe',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  describe('createEvent', () => {
    it('should create an event and participant', async () => {
      prismaService.event.create = jest.fn().mockResolvedValue({
        ...event,
        EventParticipant: [{ participant }],
      });

      const result = await service.createEvent(payload);

      expect(prismaService.event.create).toHaveBeenCalledWith({
        data: {
          name: payload.name,
          slug: expect.any(String),
          description: payload.description,
          start_date: payload.start_date,
          end_date: payload.end_date,
          EventParticipant: {
            create: {
              participant: {
                create: {
                  name: payload.creator_name,
                  slug: expect.any(String),
                },
              },
              is_event_creator: true,
            },
          },
        },
        include: { EventParticipant: { select: { participant: true } } },
      });

      expect(result).toEqual({ event, participant });
    });

    it('should throw an error if there is an error creating the event', async () => {
      prismaService.event.create = jest
        .fn()
        .mockRejectedValue(new Error('Failed to create event'));

      await expect(service.createEvent(payload)).rejects.toThrow(
        'Failed to create event',
      );
    });
  });

  describe('getEventBySlug', () => {
    it('should return the event with the given slug', async () => {
      const slug = 'test-event';

      prismaService.event.findUnique = jest.fn().mockResolvedValue(event);

      const result = await service.getEventBySlug(slug);

      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { slug },
      });

      expect(result).toEqual(event);
    });

    it('should throw an error if there is an error getting the event', async () => {
      const slug = 'test-event';

      prismaService.event.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Failed to get event'));

      await expect(service.getEventBySlug(slug)).rejects.toThrow(
        'Failed to get event',
      );
    });
  });

  describe('getEventParticipantsBySlug', () => {
    const slug = 'test-event';

    it('should return event participants by slug', async () => {
      const eventParticipants = [{ participant }];

      prismaService.eventParticipant.findMany = jest
        .fn()
        .mockResolvedValue(eventParticipants);

      const result = await service.getEventParticipantsBySlug(slug);

      expect(prismaService.eventParticipant.findMany).toHaveBeenCalledWith({
        where: { event: { slug } },
        select: { participant: true },
      });

      expect(result).toEqual(
        eventParticipants.map(
          (eventParticipant) => eventParticipant.participant,
        ),
      );
    });

    it('should throw an error if there is an error getting event participants', async () => {
      prismaService.eventParticipant.findMany = jest
        .fn()
        .mockRejectedValue(new Error('Failed to get event participants'));

      await expect(service.getEventParticipantsBySlug(slug)).rejects.toThrow(
        'Failed to get event participants',
      );
    });
  });
});
