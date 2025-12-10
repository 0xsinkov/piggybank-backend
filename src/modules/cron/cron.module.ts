import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAuth } from 'src/domain/entities/social-auth.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TwitterModule, KmsModule, SolanaModule } from 'src/infrastructure';
import {
  ClearQuestCreationsCron,
  DepositPeriodicChecksCron,
  QuestVerificationCron,
  RefreshTokensCron,
} from './services';
import { Quest } from 'src/domain';
import { QuestVerificationModule } from '../quest-verification';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialAuth, Quest]),
    TwitterModule,
    ScheduleModule.forRoot(),
    KmsModule,
    SolanaModule,
    QuestVerificationModule,
  ],
  providers: [
    RefreshTokensCron,
    ClearQuestCreationsCron,
    DepositPeriodicChecksCron,
    QuestVerificationCron,
  ],
})
export class CronModule {}
