import { BaseEntity } from 'src/infrastructure/database/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('admin_settings')
export class AdminSetting extends BaseEntity {
  @Column({
    type: Number,
  })
  questCreationFeePercentage: number; // 0.1 - 10%
}
