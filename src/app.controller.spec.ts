import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toMatchInlineSnapshot(`
        {
          "data": "Hello World!",
          "response": {
            "code": 200,
            "message": "OK",
          },
        }
      `);
    });

    it('should return http status', () => {
      expect(appController.getHttpStatus({})).toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 200,
            "message": "OK",
          },
          "response": {
            "code": 200,
            "message": "OK",
          },
        }
      `);

      expect(appController.getHttpStatus({ code: 400 })).toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 400,
            "message": "Bad Request",
          },
          "response": {
            "code": 400,
            "message": "Bad Request",
          },
        }
      `);

      expect(appController.getHttpStatus({ code: 400, error_code: 1001 }))
        .toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 1001,
            "message": "Bad Request",
          },
          "response": {
            "code": 400,
            "message": "Bad Request",
          },
        }
      `);

      expect(
        appController.getHttpStatus({
          code: 400,
          error_code: 1001,
          message: 'Custom message',
        }),
      ).toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 1001,
            "message": "Custom message",
          },
          "response": {
            "code": 400,
            "message": "Bad Request",
          },
        }
      `);

      expect(appController.getHttpStatus({ code: 1000 }))
        .toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 1000,
            "message": "Bad Request",
          },
          "response": {
            "code": 400,
            "message": "Bad Request",
          },
        }
      `);

      expect(appController.getHttpStatus({ code: 1000, error_code: 1001 }))
        .toMatchInlineSnapshot(`
        {
          "data": {
            "errorCode": 1001,
            "message": "Bad Request",
          },
          "response": {
            "code": 400,
            "message": "Bad Request",
          },
        }
      `);
    });
  });
});
