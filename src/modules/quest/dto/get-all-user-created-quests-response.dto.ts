import { ApiProperty } from '@nestjs/swagger';
import { QuestActionType } from 'src/domain';
import { GenericResponse } from 'src/infrastructure';

export class QuestActionDto {
  @ApiProperty({
    description: 'The id of the question action',
  })
  id: string;

  @ApiProperty({
    description: 'The action type of the quest action',
  })
  actionType: QuestActionType;

  @ApiProperty({
    description: 'The url of the quest action',
  })
  url: string;

  @ApiProperty({
    description: 'The reward amount of the quest action',
  })
  reward: number;
}

export class UserCreatedQuestDto {
  @ApiProperty({
    description: 'The id of the quest',
  })
  id: string;

  @ApiProperty({
    description: 'The reward amount of the quest',
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'The deposit address of the quest',
  })
  depositAddress: string;

  @ApiProperty({
    description: 'The end date of the quest',
  })
  endDate: Date;

  @ApiProperty({
    description: 'The payment status of the quest',
  })
  isPaid: boolean;

  @ApiProperty({
    description: 'The status of the quest',
  })
  isEnded: boolean;

  @ApiProperty({
    description: 'The token symbol of the quest token',
  })
  tokenSymbol: string;

  @ApiProperty({
    description: 'The expiration date of the quest',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'The question actions of the quest',
  })
  questionActions: QuestActionDto[];

  @ApiProperty({
    description: 'The description of the quest',
  })
  description: string;

  @ApiProperty({
    description: 'The title of the quest',
  })
  title: string;
}

export class GetAllUserCreatedQuestsResponse extends GenericResponse<
  UserCreatedQuestDto[]
> {
  @ApiProperty({
    description: 'The quests',
    type: UserCreatedQuestDto,
  })
  declare data: UserCreatedQuestDto[];
}
