import { Injectable, Logger } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Quest } from 'src/domain';
import { InjectRepository } from '@nestjs/typeorm';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ClearQuestCreationsCron {
  private readonly logger = new Logger(ClearQuestCreationsCron.name);

  constructor(
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearQuestCreations() {
    const quests = await this.questRepository.find({
      where: { expiresAt: LessThan(new Date()), isPaid: false },
    });

    for (const quest of quests) {
      await this.questRepository.delete(quest.id);
    }

    this.logger.log('Quest creations cleared.');
  }
}
