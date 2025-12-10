import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class TokenBalanceDto {
  @ApiProperty({
    description: 'The balance of the token',
  })
  balance: number;

  @ApiProperty({
    description: 'The minimum withdraw amount of the token',
  })
  minWithdrawAmount: number;

  @ApiProperty({
    description: 'The token decimals',
  })
  tokenDecimals: number;

  @ApiProperty({
    description: 'The token id',
  })
  tokenId: string;

  @ApiProperty({
    description: 'The token symbol',
  })
  symbol: string;

  @ApiProperty({
    description: 'The token image url',
  })
  imageUrl: string;
}

export class GetTokenBalancesResponse extends GenericResponse<
  TokenBalanceDto[]
> {
  @ApiProperty({
    description: 'The token balances',
  })
  declare data: TokenBalanceDto[];
}
