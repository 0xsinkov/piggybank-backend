import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Token } from './token.entity';

@Entity('user_token_balances')
export class UserTokenBalance extends BaseEntity {
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
  balance: number;

  @ManyToOne(() => User, (user) => user.userTokenBalances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Token, (token) => token.userTokenBalances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tokenId' })
  token: Token;
}
