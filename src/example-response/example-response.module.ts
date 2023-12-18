import { Module } from '@nestjs/common';
import { ExampleResponseController } from './example-response.controller';

@Module({
  controllers: [ExampleResponseController],
})
export class ExampleResponseModule {}
