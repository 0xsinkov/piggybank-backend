import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';
import { QuestActionDto } from './get-all-user-created-quests-response.dto';
import { QuestActionType } from 'src/domain';

export class ParticipatedQuestActionDto extends QuestActionDto {
  @ApiProperty({
    description: 'Whether the quest action is completed',
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'The url of the quest action',
  })
  url: string;

  @ApiProperty({
    description: 'The type of the quest action',
  })
  type: QuestActionType;
}
export class ParticipatedQuestDto {
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
    description: 'Whether the quest is finished',
  })
  isFinished: boolean;

  @ApiProperty({
    description: 'The actions of the quest',
  })
  actions: ParticipatedQuestActionDto[];

  @ApiProperty({
    description: 'The description of the quest',
  })
  description: string;

  @ApiProperty({
    description: 'The title of the quest',
  })
  title: string;
}

export class GetAllParticipatedQuestsResponse extends GenericResponse<
  ParticipatedQuestDto[]
> {
  @ApiProperty({
    description: 'The quests',
    type: ParticipatedQuestDto,
  })
  declare data: ParticipatedQuestDto[];
}
