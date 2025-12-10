import { ApiProperty } from '@nestjs/swagger';
import { QuestActionDto } from './get-all-user-created-quests-response.dto';
import { GenericResponse } from 'src/infrastructure/result/result.parser';

export class QuestByIdDto {
  @ApiProperty({
    description: 'The id of the quest',
  })
  id: string;

  @ApiProperty({
    description: 'The reward amount of the quest',
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'The token symbol of the quest token',
  })
  tokenSymbol: string;

  @ApiProperty({
    description: 'The token decimals of the quest token',
  })
  tokenDecimals: number;

  @ApiProperty({
    description: 'The end date of the quest',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Whether the quest is joined',
  })
  isJoined: boolean;

  @ApiProperty({
    description: 'The actions of the quest',
  })
  actions: Array<QuestActionDto & { isCompleted: boolean }>;

  @ApiProperty({
    description: 'The description of the quest',
  })
  description: string;

  @ApiProperty({
    description: 'The title of the quest',
  })
  title: string;

  @ApiProperty({
    description: 'Whether the quest is paid',
  })
  isPaid: boolean;
}

export class GetQuestByIdResponse extends GenericResponse<QuestByIdDto> {
  @ApiProperty({
    description: 'The quest',
    type: QuestByIdDto,
  })
  declare data: QuestByIdDto;
}
