import { Test, TestingModule } from '@nestjs/testing';

import { GeneralException } from '~/common/exception';
import { PrismaService } from '~/prisma/prisma.service';

import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [EventService, PrismaService],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const slug = 'test-event';
  const event = {
    id: 1,
    slug,
    name: 'Test Event',
    description: 'Test Event Description',
    start_date: '2023-12-31T23:59:00Z',
    end_date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  describe('createEvent', () => {
    it('should create an event', async () => {
      const body = {
        name: 'Test Event',
        start_date: '2022-01-01T00:00:00Z',
        end_date: '2022-01-02T00:00:00Z',
        creator_name: 'John Doe',
      };

      eventService.createEvent = jest.fn().mockResolvedValueOnce(event);

      const result = await controller.createEvent(body);

      expect(eventService.createEvent).toHaveBeenCalledWith(body);
      expect(result).toEqual(event);
    });

    it('should throw an error if required fields are missing', async () => {
      const body = {
        name: 'Test Event',
        start_date: '2022-01-01T00:00:00Z',
        end_date: '',
        creator_name: '',
      };

      await expect(controller.createEvent(body)).rejects.toThrow(
        GeneralException,
      );
    });

    it('should throw an error if date is not in RFC3339 format', async () => {
      const body = {
        name: 'Test Event',
        start_date: '2022-01-01',
        end_date: '2022-01-02',
        creator_name: 'John Doe',
      };

      await expect(controller.createEvent(body)).rejects.toThrow(
        GeneralException,
      );
    });

    it('should throw an error if start date is after end date', async () => {
      const body = {
        name: 'Test Event',
        start_date: '2022-01-02T00:00:00Z',
        end_date: '2022-01-01T00:00:00Z',
        creator_name: 'John Doe',
      };

      await expect(controller.createEvent(body)).rejects.toThrow(
        GeneralException,
      );
    });

    it('should throw an error if eventService.createEvent throws an error', async () => {
      const body = {
        name: 'Test Event',
        start_date: '2022-01-01T00:00:00Z',
        end_date: '2022-01-02T00:00:00Z',
        creator_name: 'John Doe',
      };

      eventService.createEvent = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error creating event'));

      await expect(controller.createEvent(body)).rejects.toThrow(
        GeneralException,
      );
    });
  });

  describe('getEventBySlug', () => {
    it('should get an event by slug', async () => {
      eventService.getEventBySlug = jest.fn().mockResolvedValueOnce(event);

      const result = await controller.getEventBySlug(slug);

      expect(result).toEqual(event);
      expect(eventService.getEventBySlug).toHaveBeenCalledWith(slug);
    });

    it('should throw an error if event is not found', async () => {
      const slug = 'non-existent-event';

      eventService.getEventBySlug = jest.fn().mockResolvedValueOnce(null);

      await expect(controller.getEventBySlug(slug)).rejects.toThrow(
        GeneralException,
      );
    });

    it('should throw an error if eventService.getEventBySlug throws an error', async () => {
      eventService.getEventBySlug = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error getting event'));

      await expect(controller.getEventBySlug(slug)).rejects.toThrow(
        GeneralException,
      );
    });
  });
});
