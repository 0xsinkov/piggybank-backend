import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Quest,
  QuestAction,
  QuestActionType,
  SocialProviderType,
  UserCompletedQuestAction,
  UserJoinedQuest,
} from 'src/domain';
import { Repository } from 'typeorm';
import { KmsService, Result, TwitterService } from 'src/infrastructure';
import { Keypair } from '@solana/web3.js';
import {
  CreateQuestRequestDto,
  ParticipatedQuestDto,
  UserCreatedQuestDto,
  AvailableQuestDto,
} from './dto';
import { CreateQuestResponseDto } from './dto';
import { TokenService } from '../token';
import { questCreationExpiry } from './quest.constants';
import { UserService } from '../user';
import { QuestByIdDto } from './dto/get-quest-by-id-response.dto';

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);

  constructor(
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
    @InjectRepository(QuestAction)
    private readonly questActionRepository: Repository<QuestAction>,
    @InjectRepository(UserCompletedQuestAction)
    private readonly userCompletedQuestActionRepository: Repository<UserCompletedQuestAction>,
    @InjectRepository(UserJoinedQuest)
    private readonly userJoinedQuestRepository: Repository<UserJoinedQuest>,
    private readonly kmsService: KmsService,
    private readonly tokenService: TokenService,
    private readonly twitterService: TwitterService,
    private readonly userService: UserService,
  ) {}

  public async createQuest(
    dto: CreateQuestRequestDto,
    userId: string,
  ): Promise<Result<CreateQuestResponseDto>> {
    if (dto.actions.some((a) => a.maxCount <= 0)) {
      return Result.errFrom<CreateQuestResponseDto>(
        new UnprocessableEntityException('Max count must be greater than 0'),
      );
    }

    try {
      const user = await this.userService.getUserById(userId);

      if (
        user.isErr() ||
        !user.value?.socialAuths.find(
          (s) => s.provider === SocialProviderType.TWITTER,
        )
      ) {
        return Result.errFrom<CreateQuestResponseDto>(
          new NotFoundException('User not found'),
        );
      }

      const { pkKey, publicKey } = await this._generateAndSavePrivateKey();

      if (!pkKey) {
        return Result.errFrom<CreateQuestResponseDto>(
          new UnprocessableEntityException('Private key generation failed'),
        );
      }

      const token = await this.tokenService.getTokenById(dto.tokenId);

      if (token.isErr()) {
        return Result.errFrom<CreateQuestResponseDto>(
          new NotFoundException('Invalid token'),
        );
      }

      const endDate = new Date(dto.endDate);

      if (endDate < new Date()) {
        return Result.errFrom<CreateQuestResponseDto>(
          new UnprocessableEntityException('End date must be in the future'),
        );
      }

      const questActions: QuestAction[] = [];
      let totalRewardAmount = 0;

      for (const action of dto.actions) {
        let id: string | undefined;

        if (action.action === QuestActionType.FOLLOW) {
          const username = this.twitterService.extractUsernameFromUrl(
            action.url,
          );

          if (!username) {
            return Result.errFrom<CreateQuestResponseDto>(
              new UnprocessableEntityException('Invalid action url'),
            );
          }

          this.twitterService.setAuthToken(
            user.value.socialAuths.find(
              (s) => s.provider === SocialProviderType.TWITTER,
            )!.accessToken,
          );

          id = await this.twitterService.getUserIdByUsername(username);
        } else {
          id = this.twitterService.getTweetId(action.url);
        }

        if (!id) {
          return Result.errFrom<CreateQuestResponseDto>(
            new UnprocessableEntityException('Invalid action url'),
          );
        }

        const parsedRewardAmount =
          action.rewardAmount * 10 ** token.value.decimals;

        totalRewardAmount += parsedRewardAmount;

        const questAction = this.questActionRepository.create({
          url: action.url,
          action: action.action,
          rewardAmount: parsedRewardAmount,
          platformId: id,
          maxCount: action.maxCount,
        });

        questActions.push(questAction);
      }

      const quest = this.questRepository.create({
        title: dto.title,
        description: dto.description,
        endDate,
        tokenId: dto.tokenId,
        expiresAt: new Date(Date.now() + questCreationExpiry),
        pkKey,
        userId,
        actions: questActions,
        rewardAmount: totalRewardAmount,
      });

      await this.questRepository.save(quest);

      questActions.forEach((action) => {
        action.questId = quest.id;
      });

      await this.questActionRepository.save(questActions);

      return Result.okFrom({
        id: quest.id,
        rewardAmount: quest.rewardAmount,
        depositAddress: publicKey,
      } as CreateQuestResponseDto);
    } catch (error) {
      this.logger.error(error);

      return Result.errFrom<CreateQuestResponseDto>(
        new UnprocessableEntityException((error as Error).message),
      );
    }
  }

  public async joinQuest(
    questId: string,
    userId: string,
  ): Promise<Result<boolean>> {
    const quest = await this.questRepository.findOne({
      where: {
        id: questId,
      },
    });

    if (!quest) {
      return Result.errFrom<boolean>(new NotFoundException('Quest not found'));
    }

    if (quest.isEnded) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('Quest is ended'),
      );
    }

    if (!quest.isPaid) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('Quest is not paid yet'),
      );
    }

    const existingJoinedQuest = await this.userJoinedQuestRepository.findOne({
      where: {
        questId: quest.id,
        userId,
      },
    });

    if (existingJoinedQuest) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('You have already joined this quest'),
      );
    }

    if (quest.userId === userId) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('You cannot join your own quest'),
      );
    }

    const joinedQuest = this.userJoinedQuestRepository.create({
      questId: quest.id,
      userId,
    });

    await this.userJoinedQuestRepository.save(joinedQuest);

    return Result.okFrom(true);
  }

  public async getAllUserCreatedQuests(
    userId: string,
  ): Promise<Result<UserCreatedQuestDto[]>> {
    const quests = await this.questRepository.find({
      where: {
        userId,
      },
      relations: ['actions', 'token'],
    });

    const mappedQuests = await Promise.all(
      quests.map(async (q) => {
        const depositAddress = await this.kmsService.decryptKey(q.pkKey);

        if (!depositAddress) {
          return null;
        }

        return {
          id: q.id,
          rewardAmount: q.rewardAmount,
          depositAddress: Keypair.fromSecretKey(
            Buffer.from(depositAddress),
          ).publicKey.toBase58(),
          endDate: q.endDate,
          isPaid: q.isPaid,
          isEnded: q.isEnded,
          tokenSymbol: q.token.symbol,
          expiresAt: q.expiresAt,
          questionActions: q.actions.map((a) => ({
            id: a.id,
            actionType: a.action,
            url: a.url,
            reward: a.rewardAmount,
          })),
          description: q.description,
          title: q.title,
        } as UserCreatedQuestDto;
      }),
    );

    return Result.okFrom(mappedQuests.filter((q) => q !== null));
  }

  public async getAllParticipatedUserQuests(
    userId: string,
  ): Promise<Result<ParticipatedQuestDto[]>> {
    const quests = await this.userJoinedQuestRepository.find({
      where: {
        userId,
      },
      relations: ['quest', 'quest.actions', 'quest.token'],
    });

    const userCompletedQuestActions =
      await this.userCompletedQuestActionRepository.find({
        where: {
          userId,
        },
        relations: ['questAction'],
      });

    return Result.okFrom(
      quests.map(
        (q) =>
          ({
            id: q.quest.id,
            rewardAmount: q.quest.rewardAmount,
            tokenSymbol: q.quest.token.symbol,
            endDate: q.quest.endDate,
            isFinished: q.quest.isEnded,
            actions: q.quest.actions.map((a) => ({
              id: a.id,
              actionType: a.action,
              url: a.url,
              isCompleted: userCompletedQuestActions.some(
                (cq) => cq.questAction.id === a.id,
              ),
            })),
            description: q.quest.description,
            title: q.quest.title,
          }) as ParticipatedQuestDto,
      ),
    );
  }

  public async getAllAvailableQuests(): Promise<Result<AvailableQuestDto[]>> {
    const quests = await this.questRepository.find({
      where: {
        isEnded: false,
      },
      relations: ['actions', 'token'],
    });

    return Result.okFrom(
      quests.map(
        (q) =>
          ({
            id: q.id,
            rewardAmount: q.rewardAmount,
            tokenSymbol: q.token.symbol,
            tokenDecimals: q.token.decimals,
            endDate: q.endDate,
            actions: q.actions.map((a) => ({
              id: a.id,
              actionType: a.action,
              url: a.url,
              reward: a.rewardAmount,
            })),
            description: q.description,
            title: q.title,
            isPaid: q.isPaid,
          }) as AvailableQuestDto,
      ),
    );
  }

  public async getQuestById(
    userId: string,
    questId: string,
  ): Promise<Result<QuestByIdDto>> {
    const quest = await this.questRepository.findOne({
      where: {
        id: questId,
      },
      relations: ['actions', 'token'],
    });

    if (!quest) {
      return Result.errFrom<QuestByIdDto>(
        new NotFoundException('Quest not found'),
      );
    }

    const userJoinedQuests = await this.userJoinedQuestRepository.find({
      where: {
        questId: questId,
        userId,
      },
    });

    const userCompletedQuestActions =
      await this.userCompletedQuestActionRepository.find({
        where: {
          userId,
        },
        relations: ['questAction'],
      });

    return Result.okFrom({
      id: quest.id,
      rewardAmount: quest.rewardAmount,
      tokenSymbol: quest.token.symbol,
      tokenDecimals: quest.token.decimals,
      endDate: quest.endDate,
      actions: quest.actions.map((a) => ({
        id: a.id,
        actionType: a.action,
        url: a.url,
        reward: a.rewardAmount,
        isCompleted: userCompletedQuestActions.some(
          (cq) => cq.questAction.id === a.id,
        ),
      })),
      description: quest.description,
      title: quest.title,
      isPaid: quest.isPaid,
      isJoined: userJoinedQuests.some((j) => j.questId === quest.id),
    } as QuestByIdDto);
  }

  private async _generateAndSavePrivateKey(): Promise<{
    pkKey: string | undefined;
    publicKey: string;
  }> {
    const keyPair = Keypair.generate();

    return {
      pkKey: await this.kmsService.encryptKey(Array.from(keyPair.secretKey)),
      publicKey: keyPair.publicKey.toBase58(),
    };
  }
}
