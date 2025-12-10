import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Token,
  TransactionCategory,
  UserTokenBalance,
  Transaction as TransactionEntity,
  User,
  Reward,
} from 'src/domain';
import { Repository } from 'typeorm';
import { TokenDto } from './dto/get-all-tokens-response.dto';
import { Result, SolanaService } from 'src/infrastructure';
import { TokenBalanceDto } from './dto';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';

@Injectable()
export class TokenService {
  private readonly adminPrivateKey: string;
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(UserTokenBalance)
    private readonly userTokenBalanceRepository: Repository<UserTokenBalance>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly solanaService: SolanaService,
    private readonly configService: ConfigService,
  ) {
    this.adminPrivateKey = this.configService.getOrThrow('ADMIN_PRIVATE_KEY');
  }

  public async getAllTokens(): Promise<Result<TokenDto[]>> {
    const tokens = await this.tokenRepository.find();

    return Result.okFrom(
      tokens.map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        imageUrl: token.imageUrl,
        decimals: token.decimals,
        address: token.address,
      })),
    );
  }

  public async getTokenById(id: string): Promise<Result<Token>> {
    const token = await this.tokenRepository.findOne({
      where: { id },
    });

    if (!token) {
      return Result.errFrom<Token>(new Error('Token not found'));
    }

    return Result.okFrom(token);
  }

  public async getTokenBalances(
    userId: string,
  ): Promise<Result<TokenBalanceDto[]>> {
    const tokens = await this.tokenRepository.find();

    const userTokenBalances = await this.userTokenBalanceRepository.find({
      where: { userId },
      relations: ['token'],
    });

    return Result.okFrom(
      tokens.map((t) => {
        const userTokenBalance = userTokenBalances.find(
          (utb) => utb.tokenId === t.id,
        );

        if (!userTokenBalance) {
          return {
            balance: 0,
            minWithdrawAmount: t.withdrawThreshold,
            tokenDecimals: t.decimals,
            tokenId: t.id,
            symbol: t.symbol,
            imageUrl: t.imageUrl,
          } as TokenBalanceDto;
        }

        return {
          balance: Number(userTokenBalance.balance),
          tokenDecimals: t.decimals,
          minWithdrawAmount: userTokenBalance.token.withdrawThreshold,
          tokenId: userTokenBalance.tokenId,
          symbol: userTokenBalance.token.symbol,
          imageUrl: userTokenBalance.token.imageUrl,
        } as TokenBalanceDto;
      }),
    );
  }

  public async withdrawToken(
    userId: string,
    tokenId: string,
    amount: number,
  ): Promise<Result<boolean>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.walletAddress) {
      return Result.errFrom<boolean>(
        new NotFoundException('User or wallet address not found'),
      );
    }

    const userTokenBalance = await this.userTokenBalanceRepository.findOne({
      where: { userId, tokenId },
      relations: ['token'],
    });

    if (!userTokenBalance) {
      return Result.errFrom<boolean>(
        new NotFoundException('User token balance not found'),
      );
    }

    const minWithdrawAmount = userTokenBalance.token.withdrawThreshold;

    if (amount < minWithdrawAmount) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException(
          `Cannot withdraw token below the threshold: ${minWithdrawAmount}`,
        ),
      );
    }

    if (userTokenBalance.balance < amount) {
      return Result.errFrom<boolean>(
        new UnprocessableEntityException('Insufficient token balance'),
      );
    }

    const token = userTokenBalance.token;

    const secretKey = bs58.decode(this.adminPrivateKey);
    const adminKeypair = Keypair.fromSecretKey(secretKey);

    const adminPublicKey = adminKeypair.publicKey;

    const isSolana = token.address === null;
    const solBalance = await this.solanaService.getBalance(adminPublicKey);

    const amountParsed = amount / 10 ** token.decimals;
    let hash: string;

    if (isSolana) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: adminPublicKey,
          toPubkey: new PublicKey(user.walletAddress),
          lamports: amount,
        }),
      );

      tx.feePayer = adminPublicKey;

      const signedTx = await this.solanaService.signTransaction(tx, [
        secretKey,
      ]);

      const fee = await this.solanaService.estimateTransactionFee(signedTx);

      if (solBalance < amount + fee) {
        return Result.errFrom<boolean>(new UnprocessableEntityException());
      }

      const { confirmedTx, sentTxSignature } =
        await this.solanaService.sendAndConfirmTransaction(signedTx);

      if (!confirmedTx) {
        hash = sentTxSignature;
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Transaction failed'),
        );
      }

      hash = sentTxSignature;
    } else {
      const tokenMint = new PublicKey(token.address!);

      const adminTokenAccount =
        await this.solanaService.getAssociatedTokenAddress(
          adminPublicKey,
          tokenMint,
        );

      if (!adminTokenAccount) {
        return Result.errFrom<boolean>(new UnprocessableEntityException());
      }

      const recipientTokenAccount =
        await this.solanaService.getAssociatedTokenAddress(
          new PublicKey(user.walletAddress),
          tokenMint,
        );

      if (!recipientTokenAccount) {
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Recipient token account not found'),
        );
      }

      const tokenBalance = await this.solanaService.getTokenAccountBalance(
        adminPublicKey,
        tokenMint,
      );

      if (tokenBalance < amount) {
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Insufficient token balance'),
        );
      }

      const tx = new Transaction().add(
        createTransferInstruction(
          adminTokenAccount,
          recipientTokenAccount,
          adminPublicKey,
          amount,
          [],
        ),
      );

      tx.feePayer = adminPublicKey;

      const info = await this.solanaService
        .getConnection()
        .getParsedAccountInfo(recipientTokenAccount);

      if (!info.value?.owner) {
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Recipient token account not found'),
        );
      }

      const signedTx = await this.solanaService.signTransaction(tx, [
        secretKey,
      ]);

      const fee = await this.solanaService.estimateTransactionFee(signedTx);

      if (solBalance < fee) {
        return Result.errFrom<boolean>(new UnprocessableEntityException());
      }

      const { confirmedTx, sentTxSignature } =
        await this.solanaService.sendAndConfirmTransaction(signedTx);

      if (!confirmedTx) {
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Transaction failed'),
        );
      }

      hash = sentTxSignature;
    }

    await this.userTokenBalanceRepository.update(userTokenBalance.id, {
      balance: userTokenBalance.balance - amount,
    });

    await this.transactionRepository.save({
      userId,
      tokenId,
      amount: amountParsed,
      category: TransactionCategory.WITHDRAW,
      hash,
    });

    return Result.okFrom(true);
  }
}
