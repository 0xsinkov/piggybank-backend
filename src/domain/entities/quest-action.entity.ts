import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { QuestActionType } from '../enums';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Quest } from './quest.entity';
import { UserCompletedQuestAction } from './user-completed-quest-action.entity';
import { Reward } from './reward.entity';

@Entity('quest_actions')
export class QuestAction extends BaseEntity {
  @Column({
    type: 'enum',
    enum: QuestActionType,
  })
  action: QuestActionType;

  @Column({
    type: String,
  })
  url: string;

  @Column({
    type: String,
  })
  platformId: string;

  @Column({
    type: 'uuid',
  })
  questId: string;

  @Column({
    type: Number,
    default: 10,
  })
  maxCount: number;

  @Column({
    type: 'bigint',
  })
  rewardAmount: number;

  @ManyToOne(() => Quest, (quest) => quest.actions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questId' })
  quest: Quest;

  @OneToMany(
    () => UserCompletedQuestAction,
    (userCompletedQuestAction) => userCompletedQuestAction.questAction,
    { onDelete: 'CASCADE' },
  )
  userCompletedQuestActions: UserCompletedQuestAction[];

  @OneToMany(() => Reward, (reward) => reward.questAction, {
    onDelete: 'CASCADE',
  })
  rewards: Reward[];
}
