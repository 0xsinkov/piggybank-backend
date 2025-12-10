import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, parseResult } from 'src/infrastructure';
import { RewardService } from './reward.service';
import { User } from 'src/domain';
import { rewardRoutes } from './reward.routes';
import { ClaimRewardRequestDto, GetClaimableRewardsResponse } from './dto';

@Controller(rewardRoutes.controller)
@ApiTags(rewardRoutes.tag)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get(rewardRoutes.routes.getClaimableRewards)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all claimable rewards' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The claimable rewards have been successfully retrieved.',
    type: GetClaimableRewardsResponse,
  })
  async getClaimableRewards(@CurrentUser() user: User) {
    const result = await this.rewardService.getClaimableRewards(user.id);

    return parseResult(result);
  }

  @Post(rewardRoutes.routes.claimReward)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim a reward' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward has been successfully claimed.',
  })
  async claimReward(
    @CurrentUser() user: User,
    @Query() { rewardId }: ClaimRewardRequestDto,
  ) {
    const result = await this.rewardService.claimReward(user.id, rewardId);

    return parseResult(result);
  }
}
