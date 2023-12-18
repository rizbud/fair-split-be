import { Test, TestingModule } from '@nestjs/testing';
import { ExampleResponseController } from './example-response.controller';

describe('ExampleResponseController', () => {
  let controller: ExampleResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleResponseController],
    }).compile();

    controller = module.get<ExampleResponseController>(
      ExampleResponseController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /example-response', () => {
    it('should return example response', () => {
      const expectedResponse = { message: 'Fair Split API Example Response' };

      const response = controller.getHello();

      expect(response).toEqual(expectedResponse);
    });

    it('should throw GeneralException if error query param is true', () => {
      expect(() => {
        controller.getHello({ error: 'true' });
      }).toThrowErrorMatchingInlineSnapshot(`"General Exception"`);
    });
  });

  describe('GET /example-response/pagination', () => {
    it('should return paginated data', () => {
      const expectedResponse = {
        data: [
          {
            id: 1,
            name: 'John Doe',
          },
          {
            id: 2,
            name: 'Jane Doe',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalData: 100,
          totalPage: 10,
        },
      };

      const response = controller.getPagination();

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('GET /example-response/cursor-pagination', () => {
    it('should return cursor paginated data', () => {
      const expectedResponse = {
        data: [
          {
            id: 1,
            name: 'John Doe',
          },
          {
            id: 2,
            name: 'Jane Doe',
          },
        ],
        pagination: {
          limit: 10,
          nextCursor: 'eyJpZCI6MX0=',
          prevCursor: null,
        },
      };

      const response = controller.getCursorPagination();

      expect(response).toEqual(expectedResponse);
    });
  });
});
