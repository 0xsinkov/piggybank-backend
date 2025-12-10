import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ClaimRewardRequestDto {
  @ApiProperty({
    description: 'The id of the reward to claim',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  rewardId: string;
}
