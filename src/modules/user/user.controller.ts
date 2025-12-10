import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import 'multer';
import { User } from 'src/domain';
import { CurrentUser, JwtAuthGuard, parseResult } from 'src/infrastructure';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import { GetTransactionsResponseDto } from './dto/get-transactions-response.dto';
import { UpdateUserInfoRequestDto } from './dto/update-user-info-request.dto';
import { userRoutes } from './user.routes';
import { UserService } from './user.service';

@Controller(userRoutes.controller)
@ApiTags(userRoutes.tag)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(userRoutes.routes.getProfile)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user profile has been successfully retrieved.',
    type: GetProfileResponseDto,
  })
  async getProfile(@CurrentUser() user: User) {
    const result = await this.userService.getProfile(user.id);

    return parseResult(result);
  }

  @Patch(userRoutes.routes.updateInfo)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        walletAddress: { type: 'string' },
        profilePicture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Update user info' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user info has been successfully updated.',
  })
  async updateInfo(
    @CurrentUser() user: User,
    @Body() body: UpdateUserInfoRequestDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    const result = await this.userService.updateInfo(
      user.id,
      body.username,
      body.email,
      profilePicture,
      body.walletAddress,
    );

    return parseResult(result);
  }

  @Get(userRoutes.routes.getTransactions)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The transactions have been successfully retrieved.',
    type: GetTransactionsResponseDto,
  })
  async getTransactions(@CurrentUser() user: User) {
    const result = await this.userService.getTransactions(user.id);

    return parseResult(result);
  }
}
