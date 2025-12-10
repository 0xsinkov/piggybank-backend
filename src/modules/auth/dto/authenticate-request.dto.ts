import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateRequestDto {
  @ApiProperty({
    description: 'The code',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'The state',
  })
  @IsNotEmpty()
  @IsString()
  state: string;
}
