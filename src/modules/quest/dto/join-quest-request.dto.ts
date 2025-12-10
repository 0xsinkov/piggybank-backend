import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class JoinQuestRequestDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the quest to join',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  questId: string;
}
