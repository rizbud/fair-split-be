import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleResponseModule } from './example-response/example-response.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [ExampleResponseModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
