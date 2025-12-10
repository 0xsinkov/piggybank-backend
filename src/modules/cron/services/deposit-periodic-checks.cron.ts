import { InjectRepository } from '@nestjs/typeorm';
import { Quest } from 'src/domain';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KmsService, SolanaService } from 'src/infrastructure';
import { PublicKey } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { Logger } from '@nestjs/common';

export class DepositPeriodicChecksCron {
  private readonly logger = new Logger(DepositPeriodicChecksCron.name);

  constructor(
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
    private readonly kmsService: KmsService,
    private readonly solanaService: SolanaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async depositPeriodicChecks() {
    await this.questRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const quests = await this.questRepository.find({
          where: { isPaid: false },
          relations: ['token'],
        });

        for (const quest of quests) {
          const privateKey = await this.kmsService.decryptKey(quest.pkKey);

          if (!privateKey) {
            this.logger.error(`Private key not found for quest ${quest.id}`);

            continue;
          }

          const publicKey = new PublicKey(
            Keypair.fromSecretKey(privateKey).publicKey,
          );

          let balance = 0;

          if (quest.token.address) {
            balance = await this.solanaService.getTokenAccountBalance(
              publicKey,
              new PublicKey(quest.token.address),
            );
          } else {
            balance = await this.solanaService.getBalance(publicKey);
          }

          if (balance < quest.rewardAmount) {
            this.logger.log(
              `Balance is less than quest reward amount for quest ${quest.id}`,
            );

            continue;
          }

          await transactionalEntityManager.update(Quest, quest.id, {
            isPaid: true,
          });

          this.logger.log(`Quest ${quest.id} is now paid`);
        }

        this.logger.log('Deposit periodic checks completed');
      },
    );
  }
}
