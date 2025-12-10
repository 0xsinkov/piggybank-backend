import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class CreateQuestResponseDto {
  @ApiProperty({
    description: 'The id of the quest',
  })
  id: string;

  @ApiProperty({
    description: 'The reward amount of the quest',
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'Deposit address',
  })
  depositAddress: string;
}

export class CreateQuestResponse extends GenericResponse<CreateQuestResponseDto> {
  @ApiProperty({
    description: 'The quest',
    type: CreateQuestResponseDto,
  })
  declare data: CreateQuestResponseDto;
}
