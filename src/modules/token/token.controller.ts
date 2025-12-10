import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { CurrentUser, parseResult } from 'src/infrastructure';
import { tokenRoutes } from './token.routes';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  GetAllTokensResponse,
  GetTokenBalancesResponse,
  WithdrawTokenRequestDto,
} from './dto';
import { JwtAuthGuard } from 'src/infrastructure';
import { User } from 'src/domain';

@Controller(tokenRoutes.controller)
@ApiTags(tokenRoutes.tag)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get(tokenRoutes.routes.getAllTokens)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available tokens of the platform',
    type: GetAllTokensResponse,
  })
  @ApiOperation({ summary: 'Get all tokens' })
  async getAllTokens() {
    const result = await this.tokenService.getAllTokens();

    return parseResult(result);
  }

  @Get(tokenRoutes.routes.getTokenBalances)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token balances',
    type: GetTokenBalancesResponse,
  })
  @ApiOperation({ summary: 'Get token balances' })
  async getTokenBalances(@CurrentUser() user: User) {
    const result = await this.tokenService.getTokenBalances(user.id);

    return parseResult(result);
  }

  @Post(tokenRoutes.routes.withdrawToken)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Withdraw token',
  })
  @ApiOperation({ summary: 'Withdraw token' })
  async withdrawToken(
    @CurrentUser() user: User,
    @Body() body: WithdrawTokenRequestDto,
  ) {
    const result = await this.tokenService.withdrawToken(
      user.id,
      body.tokenId,
      body.amount,
    );

    return parseResult(result);
  }
}
