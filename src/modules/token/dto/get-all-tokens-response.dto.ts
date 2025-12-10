import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class TokenDto {
  @ApiProperty({
    description: 'The id of the token',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the token',
  })
  name: string;

  @ApiProperty({
    description: 'The symbol of the token',
  })
  symbol: string;

  @ApiProperty({
    description: 'The decimals of the token',
  })
  decimals: number;

  @ApiProperty({
    description: 'The image url of the token',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'The address of the token',
  })
  address?: string;
}

export class GetAllTokensResponse extends GenericResponse<TokenDto[]> {
  @ApiProperty({
    description: 'Available tokens of the platform',
    type: [TokenDto],
  })
  declare data: TokenDto[];
}
