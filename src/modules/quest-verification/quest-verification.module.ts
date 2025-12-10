import { Module } from '@nestjs/common';
import { QuestVerificationService } from './quest-verification.service';
import { Quest, QuestAction } from 'src/domain';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterVerifierService } from './verifiers';
import { TwitterModule, KmsModule, SolanaModule } from 'src/infrastructure';
import { UserModule } from '../user';
import { RewardModule } from '../reward';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, QuestAction]),
    TwitterModule,
    UserModule,
    RewardModule,
    KmsModule,
    SolanaModule,
  ],
  providers: [TwitterVerifierService, QuestVerificationService],
  exports: [QuestVerificationService, TwitterVerifierService],
})
export class QuestVerificationModule {}
