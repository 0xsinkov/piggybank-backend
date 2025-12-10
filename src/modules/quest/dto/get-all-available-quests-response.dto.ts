import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';
import { QuestActionDto } from 'src/modules/quest/dto/get-all-user-created-quests-response.dto';

export class AvailableQuestDto {
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
  actions: QuestActionDto[];

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

  @ApiProperty({
    description: 'The token decimals of the quest token',
  })
  tokenDecimals: number;
}

export class GetAllAvailableQuestsResponse extends GenericResponse<
  AvailableQuestDto[]
> {
  @ApiProperty({
    description: 'The quests',
    type: AvailableQuestDto,
  })
  declare data: AvailableQuestDto[];
}
