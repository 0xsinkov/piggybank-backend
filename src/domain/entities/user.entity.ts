import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { SocialAuth } from './social-auth.entity';
import { UserCompletedQuestAction } from './user-completed-quest-action.entity';
import { UserTokenBalance } from './user-token-balance.entity';
import { Quest } from './quest.entity';
import { Reward } from './reward.entity';
import { UserJoinedQuest } from './user-joined-quest.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    type: String,
    nullable: true,
  })
  email?: string;

  @Column({
    type: String,
    nullable: true,
  })
  username?: string;

  @Column({
    type: String,
    nullable: true,
  })
  profilePictureUrl?: string;

  @Column({
    type: String,
    nullable: true,
  })
  walletAddress?: string;

  @Column({
    type: Boolean,
    default: false,
  })
  isRestricted: boolean;

  @Column({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @OneToMany(() => SocialAuth, (socialAuth) => socialAuth.user, {
    onDelete: 'CASCADE',
  })
  socialAuths: SocialAuth[];

  @OneToMany(
    () => UserCompletedQuestAction,
    (userCompletedQuestAction) => userCompletedQuestAction.user,
    { onDelete: 'CASCADE' },
  )
  userCompletedQuestActions: UserCompletedQuestAction[];

  @OneToMany(
    () => UserTokenBalance,
    (userTokenBalance) => userTokenBalance.user,
    { onDelete: 'CASCADE' },
  )
  userTokenBalances: UserTokenBalance[];

  @OneToMany(() => Quest, (quest) => quest.user, { onDelete: 'CASCADE' })
  quests: Quest[];

  @OneToMany(() => Reward, (reward) => reward.user, { onDelete: 'CASCADE' })
  rewards: Reward[];

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @OneToMany(() => UserJoinedQuest, (userJoinedQuest) => userJoinedQuest.user, {
    onDelete: 'CASCADE',
  })
  userJoinedQuests: UserJoinedQuest[];
}
