import { ApiProperty } from '@nestjs/swagger';
import { QuestActionType } from 'src/domain';
import { GenericResponse } from 'src/infrastructure';

export class ClaimableRewardDto {
  @ApiProperty({
    description: 'The id of the reward',
  })
  id: string;

  @ApiProperty({
    description: 'The amount of the reward',
  })
  amount: number;

  @ApiProperty({
    description: 'The symbol of the token',
  })
  tokenSymbol: string;

  @ApiProperty({
    description: 'The decimals of the token',
  })
  tokenDecimals: number;

  @ApiProperty({
    description: 'The id of the quest action',
  })
  questActionId: string;

  @ApiProperty({
    description: 'The type of the quest action',
  })
  questActionType: QuestActionType;

  @ApiProperty({
    description: 'The url of the quest',
  })
  url: string;

  @ApiProperty({
    description: 'The title of the quest',
  })
  questTitle: string;
}

export class GetClaimableRewardsResponse extends GenericResponse<
  ClaimableRewardDto[]
> {
  @ApiProperty({
    description: 'The claimable rewards',
    type: [ClaimableRewardDto],
  })
  declare data: ClaimableRewardDto[];
}
