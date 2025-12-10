import { Module } from '@nestjs/common';
import { KmsService } from './kms.service';

@Module({
  exports: [KmsService],
  providers: [KmsService],
})
export class KmsModule {}
