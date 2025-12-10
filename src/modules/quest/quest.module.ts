import { Module } from '@nestjs/common';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Quest,
  QuestAction,
  UserCompletedQuestAction,
  UserJoinedQuest,
} from 'src/domain';
import { KmsModule, TwitterModule } from 'src/infrastructure';
import { TokenModule } from '../token';
import { UserModule } from '../user';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quest,
      QuestAction,
      UserCompletedQuestAction,
      UserJoinedQuest,
    ]),
    KmsModule,
    TokenModule,
    TwitterModule,
    UserModule,
  ],
  controllers: [QuestController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}
