import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  getDefaultDataSourceOptions,
  KmsModule,
  TwitterModule,
} from './infrastructure';
import {
  AuthModule,
  CronModule,
  TokenModule,
  UserModule,
  QuestModule,
  RewardModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return getDefaultDataSourceOptions();
      },
    }),
    TwitterModule,
    UserModule,
    AuthModule,
    CronModule,
    KmsModule,
    TokenModule,
    QuestModule,
    RewardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
