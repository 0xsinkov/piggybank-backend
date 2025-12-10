import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';
import { User } from './user.entity';

@Entity('user_joined_quests')
export class UserJoinedQuest extends BaseEntity {
  @Column({
    type: 'uuid',
  })
  userId: string;

  @Column({
    type: 'uuid',
  })
  questId: string;

  @ManyToOne(() => Quest, (quest) => quest.userJoinedQuests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questId' })
  quest: Quest;

  @ManyToOne(() => User, (user) => user.userJoinedQuests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
