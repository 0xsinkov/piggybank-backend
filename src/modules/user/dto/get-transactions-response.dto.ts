import { ApiProperty } from '@nestjs/swagger';
import { TransactionCategory } from 'src/domain';
import { GenericResponse } from 'src/infrastructure';

export class TransactionDto {
  @ApiProperty({
    description: 'The hash of the transaction',
  })
  hash: string;

  @ApiProperty({
    description: 'The token symbol',
  })
  symbol: string;

  @ApiProperty({
    description: 'The token decimals',
  })
  tokenDecimals: number;

  @ApiProperty({
    description: 'The amount of the transaction',
  })
  amount: number;

  @ApiProperty({
    description: 'The category of the transaction',
  })
  category: TransactionCategory;

  @ApiProperty({
    description: 'The date of the transaction',
  })
  date: Date;
}

export class GetTransactionsResponseDto extends GenericResponse<
  TransactionDto[]
> {
  @ApiProperty({
    description: 'The list of transactions',
  })
  data: TransactionDto[];
}
