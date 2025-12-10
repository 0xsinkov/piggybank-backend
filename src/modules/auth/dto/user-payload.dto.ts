import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UserPayloadDto {
  @Expose()
  @IsNotEmpty()
  readonly id: string;

  @Expose()
  @IsNotEmpty()
  readonly address: string;
}
