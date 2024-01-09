import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/middlewares';
import { EventModule } from './event/event.module';
import { ExampleResponseModule } from './example-response/example-response.module';

@Module({
  imports: [ExampleResponseModule, EventModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
