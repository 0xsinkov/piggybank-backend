import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Transaction, User } from 'src/domain';
import { S3Module } from 'src/infrastructure';
import { UserController } from 'src/modules/user/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction]), S3Module],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
