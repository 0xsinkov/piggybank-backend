import { Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthenticateRequestDto,
  AuthenticateResponse,
  GetRedirectLinkResponse,
} from './dto';
import { authRoutes } from './auth.routes';
import { parseResult } from 'src/infrastructure';
import { ApiTags } from '@nestjs/swagger';

@Controller(authRoutes.controller)
@ApiTags(authRoutes.tag)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(authRoutes.routes.authenticate)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'JWT token',
    type: AuthenticateResponse,
  })
  @ApiOperation({ summary: 'Twitter authentication' })
  async authenticate(@Query() authenticateRequestDto: AuthenticateRequestDto) {
    return parseResult(
      await this.authService.authenticate(
        authenticateRequestDto.code,
        authenticateRequestDto.state,
      ),
    );
  }

  @Get(authRoutes.routes.getAuthUrl)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get auth url' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auth url',
    type: GetRedirectLinkResponse,
  })
  async getAuthUrl() {
    const result = await this.authService.getAuthUrl();

    return parseResult(result);
  }
}
