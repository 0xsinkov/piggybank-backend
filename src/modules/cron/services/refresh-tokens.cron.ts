import { SocialAuth } from 'src/domain';
import { TwitterService } from 'src/infrastructure';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

export class RefreshTokensCron {
  private readonly logger = new Logger(RefreshTokensCron.name);

  constructor(
    @InjectRepository(SocialAuth)
    private readonly repository: Repository<SocialAuth>,
    private readonly twitterService: TwitterService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Refreshing tokens...');

    await this.repository.manager.transaction(
      async (transactionalEntityManager) => {
        const allAuths = await transactionalEntityManager.find(SocialAuth, {
          where: {
            expiresAt: LessThan(new Date(Date.now() + 1000 * 60 * 60)),
          },
        });

        for (const auth of allAuths) {
          try {
            if (!auth.refreshToken) {
              continue;
            }

            const newToken = await this.twitterService.refreshToken(
              auth.refreshToken,
            );

            if (!newToken) {
              this.logger.warn(
                `Failed to refresh token for user ${auth.userId}. Token may be expired or revoked.`,
              );
              continue;
            }

            auth.accessToken = newToken.accessToken;
            auth.refreshToken = newToken.refreshToken;
            auth.expiresAt = new Date(Date.now() + newToken.expiresIn * 1000);

            await transactionalEntityManager.save(SocialAuth, auth);
          } catch (error) {
            this.logger.error(
              `Error refreshing token for user ${auth.userId}:`,
              error,
            );
            continue;
          }
        }

        this.logger.log('Tokens refreshed.');
      },
    );
  }
}
