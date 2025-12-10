import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { plainToInstance } from 'class-transformer';
import { Result, TwitterService } from 'src/infrastructure';
import {
  AuthenticateResponseDto,
  GetRedirectLinkResponseDto,
  UserPayloadDto,
} from './dto';
import { SocialAuth, SocialProviderType, User } from 'src/domain';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private twitterService: TwitterService,
    @InjectRepository(SocialAuth)
    private socialAuthRepository: Repository<SocialAuth>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getAuthUrl(): Promise<Result<GetRedirectLinkResponseDto>> {
    const { url, state, codeVerifier } = this.twitterService.getAuthUrl();

    await this.cacheManager.set(state, codeVerifier);

    return Result.okFrom({
      redirectLink: url,
    });
  }

  async authenticate(
    code: string,
    state: string,
  ): Promise<Result<AuthenticateResponseDto>> {
    const codeVerifier = await this.cacheManager.get<string>(state);

    if (!codeVerifier) {
      this.logger.error('Code verifier not found');

      return Result.errFrom<AuthenticateResponseDto>(
        new UnauthorizedException(),
      );
    }

    try {
      const { accessToken, refreshToken, expiresIn } =
        await this.twitterService.getAccessToken(code, codeVerifier);

      const twitterId = await this.twitterService.getTwitterId();

      const userResult = await this._upsertUserWithTwitterAuth(
        twitterId,
        accessToken,
        expiresIn,
        refreshToken,
      );

      if (userResult.isErr() || userResult.value.isDeleted) {
        this.logger.error('User not found');

        return Result.errFrom<AuthenticateResponseDto>(
          new UnauthorizedException(),
        );
      }

      return await this.generateToken(userResult.value);
    } catch (e) {
      this.logger.error('Error authenticating user', e);

      return Result.errFrom<AuthenticateResponseDto>(
        new UnauthorizedException(),
      );
    }
  }

  async validateUser(payloadUserDto: UserPayloadDto): Promise<Result<User>> {
    const user = await this.userService.getUserByPayload(payloadUserDto.id);

    if (user.isErr() || user.value === null || user.value.isDeleted) {
      return Result.errFrom<User>(new UnauthorizedException());
    }

    const socialAuthExists = await this.socialAuthRepository.exists({
      where: {
        userId: user.value.id,
        provider: SocialProviderType.TWITTER,
      },
    });

    if (!socialAuthExists) {
      return Result.errFrom<User>(
        new UnauthorizedException(
          'Social auth not found. Please re-authenticate.',
        ),
      );
    }

    return Result.okFrom(user.value);
  }

  private async generateToken(
    user: User,
  ): Promise<Result<AuthenticateResponseDto>> {
    const payload = plainToInstance(UserPayloadDto, user, {
      excludeExtraneousValues: true,
    });

    const accessToken = this.jwtService.sign({ ...payload });

    return Result.okFrom({
      accessToken,
    });
  }

  private async _upsertUserWithTwitterAuth(
    twitterId: string,
    accessToken: string,
    expiresIn: number,
    refreshToken?: string,
  ): Promise<Result<User>> {
    const existingUserResult =
      await this.userService.getUserByTwitterId(twitterId);

    if (existingUserResult.isErr()) {
      return Result.errFrom<User>(existingUserResult.error as Error);
    }

    let user = existingUserResult.value;

    if (user === null) {
      const newUserResult = await this.userService.createBlankUser();

      if (newUserResult.isErr()) {
        return Result.errFrom<User>(newUserResult.error as Error);
      }

      user = newUserResult.value;
    }

    const socialAuthResult = await this._saveOrUpdateSocialAuth(
      twitterId,
      accessToken,
      expiresIn,
      user.id,
      refreshToken,
    );

    if (socialAuthResult.isErr()) {
      return Result.errFrom<User>(socialAuthResult.error as Error);
    }

    return Result.okFrom(user);
  }

  private async _saveOrUpdateSocialAuth(
    twitterId: string,
    accessToken: string,
    expiresIn: number,
    userId: string,
    refreshToken?: string,
  ): Promise<Result<SocialAuth>> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    let socialAuth = await this.socialAuthRepository.findOne({
      where: {
        userId,
        provider: SocialProviderType.TWITTER,
      },
    });

    if (!socialAuth) {
      socialAuth = this.socialAuthRepository.create({
        provider: SocialProviderType.TWITTER,
        accessToken,
        refreshToken,
        expiresAt,
        platformId: twitterId,
        userId,
      });
    } else {
      socialAuth.accessToken = accessToken;
      socialAuth.refreshToken = refreshToken;
      socialAuth.expiresAt = expiresAt;
      socialAuth.platformId = twitterId;
    }

    const savedSocialAuth = await this.socialAuthRepository.save(socialAuth);

    return Result.okFrom(savedSocialAuth);
  }
}
