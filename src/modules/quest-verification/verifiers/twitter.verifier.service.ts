import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Result } from 'src/infrastructure';
import { QuestAction, QuestActionType, SocialProviderType } from 'src/domain';
import { Repository } from 'typeorm';
import { TwitterService } from 'src/infrastructure';
import { UserService } from 'src/modules';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class TwitterVerifierService {
  private readonly logger = new Logger(TwitterVerifierService.name);

  constructor(
    @InjectRepository(QuestAction)
    private readonly questActionRepository: Repository<QuestAction>,
    private readonly userService: UserService,
    private readonly twitterService: TwitterService,
  ) {}

  public async verifyQuestAction(
    userId: string,
    questId: string,
    actionId: string,
  ): Promise<Result<boolean>> {
    const questAction = await this.questActionRepository.findOne({
      where: {
        id: actionId,
        questId,
      },
    });

    const user = await this.userService.getUserById(userId);

    if (!questAction || user.isErr()) {
      return Result.errFrom<boolean>(
        new NotFoundException('Quest action not found'),
      );
    }

    const userTwitterId = user.value!.socialAuths.find(
      (s) => s.provider === SocialProviderType.TWITTER,
    )?.platformId;

    if (!userTwitterId) {
      return Result.errFrom<boolean>(
        new NotFoundException('User twitter id not found'),
      );
    }

    let result: boolean;

    try {
      switch (questAction.action) {
        case QuestActionType.FOLLOW: {
          result = await this._verifyFollow(
            userTwitterId,
            questAction.platformId,
          );

          break;
        }

        default: {
          result = await this._verifyRepost(
            userTwitterId,
            questAction.platformId,
          );

          break;
        }
      }
    } catch (error) {
      this.logger.error(error);

      return Result.okFrom(false);
    }

    return Result.okFrom(result);
  }

  private async _verifyFollow(
    userTwitterId: string,
    needToFollowId: string,
  ): Promise<boolean> {
    const userFollows = await this.twitterService.getUserFollows(userTwitterId);

    const isFollowing = userFollows.some((f) => f.id === needToFollowId);

    return isFollowing;
  }

  private async _verifyRepost(
    userId: string,
    platformId: string,
  ): Promise<boolean> {
    const repostedTweets = await this.twitterService.getUserReposts(userId);

    const isReposted = repostedTweets.some((t) => t.retweetId === platformId);

    return isReposted;
  }
}
