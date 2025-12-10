import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Quest } from './quest.entity';
import { UserTokenBalance } from './user-token-balance.entity';
import { Reward } from './reward.entity';
import { Transaction } from './transaction.entity';

@Entity('tokens')
export class Token extends BaseEntity {
  @Column({
    type: String,
    nullable: true,
  })
  address?: string;

  @Column({
    type: String,
  })
  symbol: string;

  @Column({
    type: String,
  })
  name: string;

  @Column({
    type: Number,
  })
  decimals: number;

  @Column({
    type: String,
    nullable: true,
  })
  imageUrl?: string;

  @Column({
    type: 'bigint',
    default: 0,
  })
  withdrawThreshold: number;

  @OneToMany(() => Quest, (quest) => quest.token, { onDelete: 'CASCADE' })
  quests: Quest[];

  @OneToMany(
    () => UserTokenBalance,
    (userTokenBalance) => userTokenBalance.token,
    { onDelete: 'CASCADE' },
  )
  userTokenBalances: UserTokenBalance[];

  @OneToMany(() => Reward, (reward) => reward.token, { onDelete: 'CASCADE' })
  rewards: Reward[];

  @OneToMany(() => Transaction, (transaction) => transaction.token, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];
}
