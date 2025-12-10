import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawTokenRequestDto {
  @ApiProperty({
    description: 'The ID of the token to withdraw',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  tokenId: string;

  @ApiProperty({
    description: 'The amount of tokens to withdraw (in token decimals)',
    example: 1_000_000,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}
