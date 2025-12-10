import { Injectable, Logger } from '@nestjs/common';
import { TwitterVerifierService } from './verifiers';
import {
  Quest,
  QuestAction,
  UserCompletedQuestAction,
  UserJoinedQuest,
} from 'src/domain';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardService } from '../reward';
import { KmsService, SolanaService } from 'src/infrastructure';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { ConfigService } from '@nestjs/config';
import { createTransferInstruction } from '@solana/spl-token';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class QuestVerificationService {
  private readonly logger = new Logger(QuestVerificationService.name);
  private readonly adminPrivateKey: string;

  constructor(
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
    private readonly twitterVerifierService: TwitterVerifierService,
    private readonly rewardService: RewardService,
    private readonly kmsService: KmsService,
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
  ) {
    this.adminPrivateKey = this.configService.getOrThrow('ADMIN_PRIVATE_KEY');
  }

  public async verifyQuests() {
    const quests = await this.questRepository.find({
      where: {
        isEnded: false,
      },
    });

    this.logger.log(`Verifying ${quests.length} quests`);

    for (const quest of quests) {
      await this.verifyTwitterQuestActions(quest.id);

      if (quest.endDate < new Date()) {
        await this._finishQuest(quest.id);
      }
    }
  }

  public async verifyTwitterQuestActions(questId: string) {
    await this.questRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const allQuestActions = await transactionalEntityManager.find(
          QuestAction,
          {
            where: {
              questId,
            },
          },
        );

        this.logger.log(`Verifying ${allQuestActions.length} quest actions`);

        for (const questAction of allQuestActions) {
          const questJoinedUsers = await transactionalEntityManager.find(
            UserJoinedQuest,
            {
              where: {
                questId,
              },
            },
          );

          this.logger.log(
            `Verifying ${questJoinedUsers.length} quest joined users`,
          );

          await transactionalEntityManager.delete(UserCompletedQuestAction, {
            questActionId: questAction.id,
          });

          this.logger.log(
            `Deleted ${questJoinedUsers.length} quest joined users`,
          );

          let count = 0;

          for (const questJoinedUser of questJoinedUsers) {
            if (count > questAction.maxCount) {
              break;
            }

            this.logger.log(
              `Verifying ${questJoinedUser.userId} quest joined user`,
            );

            const result = await this.twitterVerifierService.verifyQuestAction(
              questJoinedUser.userId,
              questAction.questId,
              questAction.id,
            );

            if (result.isErr()) {
              continue;
            }

            const isCompleted = result.value;

            if (!isCompleted) {
              continue;
            }

            const userCompletedQuestAction = transactionalEntityManager.create(
              UserCompletedQuestAction,
              {
                questActionId: questAction.id,
                userId: questJoinedUser.userId,
              },
            );

            await transactionalEntityManager.save(userCompletedQuestAction);

            count++;
          }
        }
      },
    );
  }

  private async _finishQuest(questId: string) {
    await this.questRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const quest = await transactionalEntityManager.findOne(Quest, {
          where: {
            id: questId,
          },
          relations: ['token'],
        });

        if (!quest) {
          return;
        }

        const questActions = await transactionalEntityManager.find(
          QuestAction,
          {
            where: {
              questId: quest.id,
            },
          },
        );

        const isWithdrawn = await this._withdrawFromVault(quest);

        if (!isWithdrawn) {
          this.logger.error(
            `Failed to withdraw from vault for quest ${questId}`,
          );

          return;
        }

        this.logger.log(`Withdrawn from vault for quest ${questId}`);

        for (const questAction of questActions) {
          const questCompletedUsers = await transactionalEntityManager.find(
            UserCompletedQuestAction,
            {
              where: {
                questActionId: questAction.id,
              },
            },
          );

          if (questCompletedUsers.length === 0) {
            continue;
          }

          const rewardAmountPerUser =
            questAction.rewardAmount / questCompletedUsers.length;

          await this.rewardService.saveRewards(
            questCompletedUsers.map((questCompletedUser) => ({
              amount: rewardAmountPerUser,
              questActionId: questAction.id,
              tokenId: quest.tokenId,
              userId: questCompletedUser.userId,
            })),
          );

          this.logger.log(
            `Saved ${questCompletedUsers.length} rewards for quest ${questId}`,
          );
        }

        await transactionalEntityManager.update(Quest, questId, {
          isEnded: true,
        });

        this.logger.log(`Finished quest ${questId}`);
      },
    );
  }

  private async _withdrawFromVault(quest: Quest): Promise<boolean> {
    const vaultPrivateKey = await this.kmsService.decryptKey(quest.pkKey);

    if (!vaultPrivateKey) {
      return false;
    }

    const vaultPublicKey = new PublicKey(
      Keypair.fromSecretKey(vaultPrivateKey).publicKey,
    );

    const secretKey = bs58.decode(this.adminPrivateKey);
    const adminKeypair = Keypair.fromSecretKey(secretKey);

    const adminPublicKey = adminKeypair.publicKey;

    const isSolana = quest.token.address === null;

    const solBalance = await this.solanaService.getBalance(vaultPublicKey);
    const adminSolBalance = await this.solanaService.getBalance(adminPublicKey);

    if (isSolana) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: vaultPublicKey,
          toPubkey: adminPublicKey,
          lamports: quest.rewardAmount,
        }),
      );

      tx.feePayer = vaultPublicKey;

      const signedTx = await this.solanaService.signTransaction(tx, [
        vaultPrivateKey,
      ]);

      const fee = await this.solanaService.estimateTransactionFee(signedTx);

      if (solBalance < quest.rewardAmount + fee) {
        this.logger.error(
          `Insufficient balance for SOL withdrawal for quest ${quest.id}`,
        );

        if (adminSolBalance < fee) {
          this.logger.error(
            `Insufficient admin SOL balance for quest ${quest.id}`,
          );

          return false;
        }

        const solTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: adminPublicKey,
            toPubkey: vaultPublicKey,
            lamports: fee,
          }),
        );

        solTx.feePayer = adminPublicKey;

        const solSignedTx = await this.solanaService.signTransaction(solTx, [
          secretKey,
        ]);

        const { confirmedTx: solConfirmedTx } =
          await this.solanaService.sendAndConfirmTransaction(solSignedTx);

        if (!solConfirmedTx) {
          this.logger.error(
            `Failed to send and confirm SOL transaction for quest ${quest.id}`,
          );

          return false;
        }
      }

      await delay(10000);

      const { confirmedTx } =
        await this.solanaService.sendAndConfirmTransaction(signedTx);

      if (!confirmedTx) {
        this.logger.error(
          `Failed to send and confirm transaction for quest ${quest.id}`,
        );

        return false;
      }
    } else {
      const tokenMint = new PublicKey(quest.token.address!);

      const fromTokenAccount =
        await this.solanaService.getAssociatedTokenAddress(
          vaultPublicKey,
          tokenMint,
        );

      if (!fromTokenAccount) {
        this.logger.error(
          `Failed to get associated token address for quest ${quest.id}`,
        );

        return false;
      }

      const recipientTokenAccount =
        await this.solanaService.getAssociatedTokenAddress(
          adminPublicKey,
          tokenMint,
        );

      if (!recipientTokenAccount) {
        this.logger.error(
          `Failed to get associated token address for quest ${quest.id}`,
        );

        return false;
      }

      const tokenBalance = await this.solanaService.getTokenAccountBalance(
        vaultPublicKey,
        tokenMint,
      );

      if (tokenBalance < quest.rewardAmount) {
        this.logger.error(`Insufficient token balance for quest ${quest.id}`);

        return false;
      }

      const tx = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          recipientTokenAccount,
          vaultPublicKey,
          quest.rewardAmount,
          [],
        ),
      );

      tx.feePayer = vaultPublicKey;

      const signedTx = await this.solanaService.signTransaction(tx, [
        vaultPrivateKey,
      ]);

      const fee = await this.solanaService.estimateTransactionFee(signedTx);

      if (solBalance < fee) {
        this.logger.error(`Insufficient balance for quest ${quest.id}`);

        if (adminSolBalance < fee) {
          this.logger.error(
            `Insufficient admin SOL balance for quest ${quest.id}`,
          );

          return false;
        }

        let solTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: adminPublicKey,
            toPubkey: vaultPublicKey,
            lamports: fee,
          }),
        );

        const info = await this.solanaService
          .getConnection()
          .getParsedAccountInfo(vaultPublicKey);

        let rentExemptionAmount = undefined;

        if (!info.value?.owner) {
          rentExemptionAmount = await this.solanaService
            .getConnection()
            .getMinimumBalanceForRentExemption(0);

          const createAccountParams = {
            fromPubkey: adminPublicKey,
            newAccountPubkey: vaultPublicKey,
            lamports: rentExemptionAmount,
            space: 0,
            programId: SystemProgram.programId,
          };

          solTx = new Transaction()
            .add(SystemProgram.createAccount(createAccountParams))
            .add(
              SystemProgram.transfer({
                fromPubkey: adminPublicKey,
                toPubkey: vaultPublicKey,
                lamports: fee,
              }),
            );
        }

        solTx.feePayer = adminPublicKey;

        const solSignedTx = await this.solanaService.signTransaction(solTx, [
          secretKey,
          vaultPrivateKey,
        ]);

        const { confirmedTx: solConfirmedTx } =
          await this.solanaService.sendAndConfirmTransaction(solSignedTx);

        if (!solConfirmedTx) {
          this.logger.error(
            `Failed to send and confirm SOL transaction for quest ${quest.id}`,
          );

          return false;
        }
      }

      await delay(10000);

      const { confirmedTx } =
        await this.solanaService.sendAndConfirmTransaction(signedTx);

      if (!confirmedTx) {
        this.logger.error(
          `Failed to send and confirm transaction for quest ${quest.id}`,
        );

        return false;
      }
    }

    return true;
  }
}
