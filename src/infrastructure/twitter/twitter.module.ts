import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterService, RapidApiService } from './services';

@Module({
  imports: [HttpModule],
  providers: [TwitterService, RapidApiService],
  exports: [TwitterService, RapidApiService],
})
export class TwitterModule {}
