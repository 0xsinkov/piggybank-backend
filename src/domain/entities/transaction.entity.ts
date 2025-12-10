import { Token, User } from 'src/domain';
import { TransactionCategory } from 'src/domain/enums';
import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  hash: string;

  @Column({
    type: 'uuid',
  })
  userId: string;

  @Column({
    type: 'uuid',
  })
  tokenId: string;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category: TransactionCategory;

  @Column({
    type: 'decimal',
  })
  amount: number;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Token, (token) => token.transactions)
  token: Token;
}
