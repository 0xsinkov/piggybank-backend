import { Module } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Reward, UserTokenBalance } from 'src/domain';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
  imports: [TypeOrmModule.forFeature([Reward, UserTokenBalance])],
})
export class RewardModule {}
