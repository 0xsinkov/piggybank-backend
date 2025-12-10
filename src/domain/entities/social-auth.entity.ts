import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { SocialProviderType } from '../enums';

@Entity('social_auth')
export class SocialAuth extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SocialProviderType,
  })
  provider: SocialProviderType;

  @Column({
    type: String,
  })
  accessToken: string;

  @Column({
    type: String,
    nullable: true,
  })
  platformId?: string;

  @Column({
    type: String,
    nullable: true,
  })
  refreshToken?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;

  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.socialAuths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
