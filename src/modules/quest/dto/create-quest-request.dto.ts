import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestActionType } from 'src/domain';
import { Type } from 'class-transformer';

export class CreateQuestActionDto {
  @ApiProperty({
    description: 'The url of the action',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'The type of the action',
    enum: QuestActionType,
    example: QuestActionType.FOLLOW,
  })
  @IsNotEmpty()
  @IsEnum(QuestActionType)
  action: QuestActionType;

  @ApiProperty({
    description: 'The maximum count of the participants in the action',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  maxCount: number;

  @ApiProperty({
    description: 'The reward amount of the action (in decimals of the token)',
    example: 1000000000,
  })
  @IsNotEmpty()
  @IsNumber()
  rewardAmount: number;
}

export class CreateQuestRequestDto {
  @ApiProperty({
    description: 'The title of the quest',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the quest',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The end date of the quest',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'The actions of the quest',
    type: [CreateQuestActionDto],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateQuestActionDto)
  actions: CreateQuestActionDto[];

  @ApiProperty({
    description: 'The token id of the deposit token',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  tokenId: string;
}
