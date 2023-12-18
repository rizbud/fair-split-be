import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleResponseModule } from './example-response/example-response.module';

@Module({
  imports: [ExampleResponseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
