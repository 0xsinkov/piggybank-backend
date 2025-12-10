import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class GetRedirectLinkResponseDto {
  @ApiProperty({
    description: 'Redirect link',
    example: 'https://example.com/redirect',
  })
  redirectLink: string;
}

export class GetRedirectLinkResponse extends GenericResponse<GetRedirectLinkResponseDto> {
  @ApiProperty({
    description: 'Response data containing redirect link',
    type: GetRedirectLinkResponseDto,
  })
  declare data: GetRedirectLinkResponseDto;
}
