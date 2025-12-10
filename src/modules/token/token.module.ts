import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Token,
  UserTokenBalance,
  Reward,
  User,
  Transaction as TransactionEntity,
} from 'src/domain';
import { SolanaModule } from 'src/infrastructure';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Token,
      UserTokenBalance,
      Reward,
      User,
      TransactionEntity,
    ]),
    SolanaModule,
    ConfigModule,
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
