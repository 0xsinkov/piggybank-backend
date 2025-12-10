import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, parseResult } from 'src/infrastructure';
import {
  CreateQuestRequestDto,
  CreateQuestResponse,
  GetAllUserCreatedQuestsResponse,
  GetAllParticipatedQuestsResponse,
  JoinQuestRequestDto,
  GetAllAvailableQuestsResponse,
} from './dto';
import { questRoutes } from './quest.routes';
import { User } from 'src/domain';
import { GetQuestByIdResponse } from './dto/get-quest-by-id-response.dto';

@Controller(questRoutes.controller)
@ApiTags(questRoutes.tag)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post(questRoutes.routes.createQuest)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a quest' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The quest has been successfully created.',
    type: CreateQuestResponse,
  })
  async createQuest(
    @Body() dto: CreateQuestRequestDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.questService.createQuest(dto, user.id);

    return parseResult(result);
  }

  @Post(questRoutes.routes.joinQuest)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a quest' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The quest has been successfully joined.',
  })
  async joinQuest(@Body() dto: JoinQuestRequestDto, @CurrentUser() user: User) {
    const result = await this.questService.joinQuest(dto.questId, user.id);

    return parseResult(result);
  }

  @Get(questRoutes.routes.getAllUserCreatedQuests)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user created quests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user created quests have been successfully retrieved.',
    type: GetAllUserCreatedQuestsResponse,
  })
  async getAllUserCreatedQuests(@CurrentUser() user: User) {
    const result = await this.questService.getAllUserCreatedQuests(user.id);

    return parseResult(result);
  }

  @Get(questRoutes.routes.getAllParticipatedUserQuests)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all participated user quests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The participated user quests have been successfully retrieved.',
    type: GetAllParticipatedQuestsResponse,
  })
  async getAllParticipatedUserQuests(@CurrentUser() user: User) {
    const result = await this.questService.getAllParticipatedUserQuests(
      user.id,
    );

    return parseResult(result);
  }

  @Get(questRoutes.routes.getAllAvailableQuests)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all available quests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The available quests have been successfully retrieved.',
    type: GetAllAvailableQuestsResponse,
  })
  async getAllAvailableQuests() {
    const result = await this.questService.getAllAvailableQuests();

    return parseResult(result);
  }

  @Get(questRoutes.routes.getQuestById)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get quest by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The quest has been successfully retrieved.',
    type: GetQuestByIdResponse,
  })
  async getQuestById(
    @Param('questId') questId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.questService.getQuestById(user.id, questId);

    return parseResult(result);
  }
}
