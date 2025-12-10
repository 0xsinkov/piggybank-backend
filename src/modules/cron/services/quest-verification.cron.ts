import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestVerificationService } from 'src/modules/quest-verification';

@Injectable()
export class QuestVerificationCron {
  constructor(
    private readonly questVerificationService: QuestVerificationService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    await this.questVerificationService.verifyQuests();
  }
}
