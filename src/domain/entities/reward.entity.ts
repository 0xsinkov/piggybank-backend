import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { QuestAction } from './quest-action.entity';
import { User } from './user.entity';
import { Token } from './token.entity';

@Entity('rewards')
export class Reward extends BaseEntity {
  @Column({
    type: 'uuid',
  })
  userId: string;

  @Column({
    type: 'uuid',
  })
  tokenId: string;

  @Column({
    type: 'bigint',
  })
  amount: number;

  @Column({
    type: 'uuid',
  })
  questActionId: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isClaimed: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dateClaimed?: Date;

  @ManyToOne(() => QuestAction, (questAction) => questAction.rewards)
  questAction: QuestAction;

  @ManyToOne(() => User, (user) => user.rewards)
  user: User;

  @ManyToOne(() => Token, (token) => token.rewards)
  token: Token;
}
