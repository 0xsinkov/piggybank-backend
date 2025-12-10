import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class AuthenticateResponseDto {
  @ApiProperty({
    description: 'The JWT token',
  })
  accessToken: string;
}

export class AuthenticateResponse extends GenericResponse<AuthenticateResponseDto> {
  @ApiProperty({
    description: 'The JWT token',
    type: AuthenticateResponseDto,
  })
  declare data: AuthenticateResponseDto;
}
