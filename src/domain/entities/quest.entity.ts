import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Token } from './token.entity';
import { QuestAction } from './quest-action.entity';
import { User } from './user.entity';
import { UserJoinedQuest } from './user-joined-quest.entity';

@Entity('quests')
export class Quest extends BaseEntity {
  @Column({
    type: 'bigint',
  })
  rewardAmount: number;

  @Column({
    type: Number,
    default: 0,
  })
  usersToDistributeCount: number;

  @Column({
    type: String,
  })
  title: string;

  @Column({
    type: String,
  })
  description: string;

  @Column({
    type: Date,
  })
  endDate: Date;

  @Column({
    type: Boolean,
    default: false,
  })
  isEnded: boolean;

  @Column({
    type: Boolean,
    default: false,
  })
  isPaid: boolean;

  @Column({
    type: Date,
  })
  expiresAt: Date;

  @Column({
    type: String,
  })
  pkKey: string; // key on Azure KV or AWS KMS

  @Column({
    type: 'uuid',
  })
  tokenId: string;

  @ManyToOne(() => Token, (token) => token.quests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tokenId' })
  token: Token;

  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.quests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => QuestAction, (action) => action.quest, {
    onDelete: 'CASCADE',
  })
  actions: QuestAction[];

  @OneToMany(
    () => UserJoinedQuest,
    (userJoinedQuest) => userJoinedQuest.quest,
    {
      onDelete: 'CASCADE',
    },
  )
  userJoinedQuests: UserJoinedQuest[];
}
