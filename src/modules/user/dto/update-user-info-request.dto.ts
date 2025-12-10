import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserInfoRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  walletAddress?: string;
}
