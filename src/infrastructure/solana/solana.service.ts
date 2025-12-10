import { Injectable } from '@nestjs/common';
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { Logger } from '@nestjs/common';

@Injectable()
export class SolanaService {
  private connection: Connection;
  private readonly logger = new Logger(SolanaService.name);

  constructor(configService: ConfigService) {
    this.connection = new Connection(
      configService.getOrThrow('SOLANA_RPC_URL'),
    );
  }

  public async getBalance(publicKey: PublicKey) {
    return await this.connection.getBalance(publicKey);
  }

  public async getAssociatedTokenAddress(
    publicKey: PublicKey,
    tokenMint: PublicKey,
  ) {
    try {
      return await getAssociatedTokenAddress(tokenMint, publicKey);
    } catch {
      return undefined;
    }
  }

  public async estimateTransactionFee(transaction: Transaction) {
    const message = transaction.compileMessage();
    const fee = await this.connection.getFeeForMessage(message);

    return fee.value ?? 0;
  }

  public async getTokenAccountBalance(
    publicKey: PublicKey,
    tokenMint: PublicKey,
  ) {
    try {
      const tokenAccount = await this.getAssociatedTokenAddress(
        publicKey,
        tokenMint,
      );

      if (!tokenAccount) {
        return 0;
      }

      const balance = await getAccount(this.connection, tokenAccount);

      return +balance.amount.toString();
    } catch (e) {
      this.logger.error(e);

      return 0;
    }
  }

  public getConnection() {
    return this.connection;
  }

  public async signTransaction(
    transaction: Transaction,
    privateKeys: Uint8Array<ArrayBufferLike>[],
  ) {
    const keyPairs = privateKeys.map((privateKey) =>
      Keypair.fromSecretKey(privateKey),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.partialSign(...keyPairs);

    return transaction;
  }

  public async sendAndConfirmTransaction(transaction: Transaction) {
    const sentTxSignature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();

    const confirmedTx = await this.connection.confirmTransaction({
      signature: sentTxSignature,
      blockhash,
      lastValidBlockHeight,
    });

    return { confirmedTx, sentTxSignature };
  }
}
