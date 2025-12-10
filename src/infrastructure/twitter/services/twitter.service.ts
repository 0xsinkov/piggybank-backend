import { Injectable, Logger } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { TwitterBaseService } from '../interfaces/twitter-service.interface';
import {
  BaseRapidApiResponseDto,
  GetAccessTokenResponseDto,
  GetAuthUrlDto,
  GetUserFollowingResponseDto,
  GetUserTweetsResponseDto,
  RetweetDto,
  UserFollowDto,
} from '../dto';
import { ConfigService } from '@nestjs/config';
import { RapidApiService } from './rapid-api.service';

@Injectable()
export class TwitterService extends TwitterBaseService {
  private readonly logger = new Logger(TwitterService.name);
  private client: TwitterApi;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly rapidApiService: RapidApiService,
  ) {
    super();

    this.clientId = this.configService.getOrThrow<string>('TWITTER_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>(
      'TWITTER_CLIENT_SECRET',
    );
    this.callbackUrl = this.configService.getOrThrow<string>(
      'TWITTER_CALLBACK_URL',
    );

    this.client = new TwitterApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });
  }

  public setAuthToken(authToken: string) {
    this.client = new TwitterApi(authToken);
  }

  public async getTwitterId(): Promise<string> {
    const user = await this.client.currentUserV2();

    return user.data.id;
  }

  public getAuthUrl(): GetAuthUrlDto {
    this.client = new TwitterApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
      this.callbackUrl,
      {
        scope: ['tweet.read', 'users.read', 'offline.access'],
      },
    );

    return { url, codeVerifier, state };
  }

  public async getAccessToken(
    code: string,
    codeVerifier: string,
  ): Promise<GetAccessTokenResponseDto> {
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await this.client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: this.callbackUrl,
    });

    this.client = loggedClient;

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  public async refreshToken(
    refreshToken: string,
  ): Promise<GetAccessTokenResponseDto | undefined> {
    this.client = new TwitterApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    try {
      const {
        client: loggedClient,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = await this.client.refreshOAuth2Token(refreshToken);

      this.client = loggedClient;

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error;

      this.logger.error(
        'Error refreshing token',
        JSON.stringify(
          {
            message: err.message,
            code: err.code,
            data: err.data,
            rateLimit: err.rateLimit,
          },
          null,
          2,
        ),
      );

      return undefined;
    }
  }

  public async getUserFollows(twitterId: string): Promise<UserFollowDto[]> {
    const response = await this.rapidApiService.get<
      BaseRapidApiResponseDto<GetUserFollowingResponseDto>
    >('/user/following', {
      user_id: twitterId,
    });

    if (!response.results) {
      return [];
    }

    return response.results.map((follow) => ({
      id: follow.user_id,
      name: follow.name,
      username: follow.username,
    })) as UserFollowDto[];
  }

  public async getUserReposts(twitterId: string): Promise<RetweetDto[]> {
    const response = await this.rapidApiService.get<
      BaseRapidApiResponseDto<GetUserTweetsResponseDto>
    >('/user/tweets', {
      user_id: twitterId,
    });

    if (!response.results) {
      return [];
    }

    return response.results
      .filter((t) => t.retweet_tweet_id !== undefined)
      .map((tweet) => ({
        id: tweet.tweet_id,
        authorId: tweet.user.user_id,
        createdAt: new Date(tweet.creation_date ?? ''),
        text: tweet.text,
        retweetId: tweet.retweet_tweet_id,
      })) as RetweetDto[];
  }

  public async getUserIdByUsername(
    username: string,
  ): Promise<string | undefined> {
    const user = await this.client.v2.userByUsername(username);

    return user.errors ? undefined : user.data.id;
  }

  public extractUsernameFromUrl(url: string): string | undefined {
    const match = url.match(/(?:x\.com|twitter\.com)\/([^/?]+)/);

    return match?.[1];
  }

  public getTweetId(url: string): string | undefined {
    const match = url.match(/status\/(\d+)/);

    return match?.[1];
  }
}
