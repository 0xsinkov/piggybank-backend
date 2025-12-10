import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { QuestAction } from './quest-action.entity';
import { User } from './user.entity';

@Entity('user_completed_quest_actions')
export class UserCompletedQuestAction extends BaseEntity {
  @Column({
    type: 'uuid',
  })
  userId: string;

  @Column({
    type: 'uuid',
  })
  questActionId: string;

  @ManyToOne(
    () => QuestAction,
    (questAction) => questAction.userCompletedQuestActions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'questActionId' })
  questAction: QuestAction;

  @ManyToOne(() => User, (user) => user.userCompletedQuestActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
