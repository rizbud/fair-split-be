import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const port = process.env.APP_PORT ?? 3333;
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: true,
    bodyParser: true,
  });
  const logger = new Logger('MAIN');

  app.useGlobalFilters(new HttpExceptionFilter());

  BigInt.prototype['toJSON'] = function () {
    return this.toString();
  };

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });
}
bootstrap();
