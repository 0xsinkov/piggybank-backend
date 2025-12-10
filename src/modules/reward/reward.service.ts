import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from 'src/domain';
import { UserTokenBalance } from 'src/domain';
import { Repository } from 'typeorm';
import { ClaimableRewardDto, SaveRewardDto } from './dto';
import { Result } from 'src/infrastructure';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(UserTokenBalance)
    private readonly userTokenBalanceRepository: Repository<UserTokenBalance>,
  ) {}

  public async saveRewards(
    rewards: SaveRewardDto[],
  ): Promise<Result<Reward[]>> {
    const rewardsToSave = rewards.map((reward) => {
      return this.rewardRepository.create({
        amount: reward.amount,
        questActionId: reward.questActionId,
        tokenId: reward.tokenId,
        userId: reward.userId,
      });
    });

    return Result.okFrom(await this.rewardRepository.save(rewardsToSave));
  }

  public async getClaimableRewards(
    userId: string,
  ): Promise<Result<ClaimableRewardDto[]>> {
    const rewards = await this.rewardRepository.find({
      where: { userId, isClaimed: false },
      relations: ['questAction', 'token', 'questAction.quest'],
    });

    const claimableRewards = rewards.map((reward) => {
      return {
        id: reward.id,
        amount: reward.amount,
        tokenSymbol: reward.token.symbol,
        tokenDecimals: reward.token.decimals,
        questActionId: reward.questActionId,
        questActionType: reward.questAction.action,
        questTitle: reward.questAction.quest.title,
        url: reward.questAction.url,
      };
    });

    return Result.okFrom(claimableRewards);
  }

  public async claimReward(
    userId: string,
    rewardId: string,
  ): Promise<Result<boolean>> {
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId, userId },
    });

    if (!reward) {
      return Result.errFrom<boolean>(new NotFoundException('Reward not found'));
    }

    if (reward.isClaimed) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('Reward is already claimed'),
      );
    }

    const userTokenBalance = await this.userTokenBalanceRepository.findOne({
      where: { userId, tokenId: reward.tokenId },
    });

    if (!userTokenBalance) {
      const newUserTokenBalance = this.userTokenBalanceRepository.create({
        userId,
        tokenId: reward.tokenId,
        balance: reward.amount,
      });

      await this.userTokenBalanceRepository.save(newUserTokenBalance);
    } else {
      userTokenBalance.balance =
        Number(userTokenBalance.balance) + Number(reward.amount);

      await this.userTokenBalanceRepository.save(userTokenBalance);
    }

    reward.isClaimed = true;
    reward.dateClaimed = new Date();

    await this.rewardRepository.save(reward);

    return Result.okFrom(true);
  }
}
