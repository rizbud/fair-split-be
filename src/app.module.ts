import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/middlewares';
import { EventModule } from './event/event.module';
import { ExampleResponseModule } from './example-response/example-response.module';
import { ExpenseModule } from './expense/expense.module';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [ExampleResponseModule, EventModule, ExpenseModule],
  controllers: [AppController],
  providers: [FirebaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
