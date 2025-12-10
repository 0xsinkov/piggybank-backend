import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Result } from 'src/infrastructure';
import { SocialProviderType, Transaction, User } from 'src/domain';
import { S3Service } from 'src/infrastructure';
import { TransactionDto } from 'src/modules/user/dto/get-transactions-response.dto';
import { ProfileDto } from 'src/modules/user/dto/get-profile-response.dto';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private s3Service: S3Service,
  ) {}

  public async getAllUsers(): Promise<Result<User[]>> {
    return Result.resultFromAsync(this.userRepository.find());
  }

  public async getUserByPayload(id: string): Promise<Result<User | null>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return Result.okFrom(user);
  }

  public async getUserById(id: string): Promise<Result<User | null>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        socialAuths: true,
      },
    });

    return Result.okFrom(user);
  }

  public async getProfile(userId: string): Promise<Result<ProfileDto>> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return Result.errFrom<ProfileDto>(new Error('User not found'));
    }

    const profile: ProfileDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      isRestricted: user.isRestricted,
      walletAddress: user.walletAddress,
    };

    return Result.okFrom(profile);
  }

  public async getUserByTwitterId(
    twitterId: string,
  ): Promise<Result<User | null>> {
    const user = await this.userRepository.findOne({
      where: {
        socialAuths: {
          provider: SocialProviderType.TWITTER,
          platformId: twitterId,
        },
      },
      relations: {
        socialAuths: true,
      },
    });

    return Result.okFrom(user);
  }

  public async createBlankUser(): Promise<Result<User>> {
    const user = this.userRepository.create({});

    await this.userRepository.save(user);

    return Result.okFrom(user);
  }

  public async updateInfo(
    userId: string,
    username?: string,
    email?: string,
    profilePicture?: Express.Multer.File,
    walletAddress?: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return Result.errFrom(new Error('User not found'));
    }

    if (email) {
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    if (profilePicture) {
      const profilePictureUrl = await this.s3Service.uploadBlob(
        Buffer.from(profilePicture.buffer),
        `${user.id}-${profilePicture.originalname}`,
      );

      user.profilePictureUrl = profilePictureUrl;
    }

    if (walletAddress) {
      try {
        const walletPublicKey = new PublicKey(walletAddress);
        if (!PublicKey.isOnCurve(walletPublicKey)) {
          return Result.errFrom<boolean>(
            new UnprocessableEntityException('Invalid wallet address'),
          );
        }
      } catch {
        return Result.errFrom<boolean>(
          new UnprocessableEntityException('Invalid wallet address'),
        );
      }

      user.walletAddress = walletAddress;
    }

    await this.userRepository.save(user);

    return Result.okFrom(user);
  }

  public async getTransactions(
    userId: string,
  ): Promise<Result<TransactionDto[]>> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['token'],
    });

    return Result.okFrom(
      transactions.map(
        (transaction) =>
          ({
            hash: transaction.hash,
            symbol: transaction.token.symbol,
            tokenDecimals: transaction.token.decimals,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.createdAt,
          }) as TransactionDto,
      ),
    );
  }

  public async deleteAccount(userId: string): Promise<Result<boolean>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return Result.errFrom<boolean>(new NotFoundException('User not found'));
    }

    await this.userRepository.update(userId, {
      isDeleted: true,
    });

    return Result.okFrom(true);
  }
}
