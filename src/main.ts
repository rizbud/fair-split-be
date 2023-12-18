import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const port = process.env.APP_PORT ?? 3333;
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
