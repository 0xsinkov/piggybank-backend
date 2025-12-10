/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { TwitterBaseService } from '../../interfaces/twitter-service.interface';
import {
  GetAccessTokenResponseDto,
  RetweetDto,
  UserFollowDto,
  GetAuthUrlDto,
} from '../../dto';
import {
  MOCK_TWITTER_SERVICE_ACCESS_TOKEN,
  MOCK_TWITTER_SERVICE_CALLBACK_URL,
  MOCK_TWITTER_SERVICE_CODE_VERIFIER,
  MOCK_TWITTER_SERVICE_REFRESH_TOKEN,
  MOCK_TWITTER_SERVICE_STATE,
  MOCK_TWITTER_SERVICE_TWITTER_ID,
  MOCK_TWITTER_SERVICE_USER_FOLLOWS,
  MOCK_TWITTER_SERVICE_USER_REPOSTS,
} from './mock.constants';

@Injectable()
export class MockTwitterService extends TwitterBaseService {
  public userFollows: UserFollowDto[] = MOCK_TWITTER_SERVICE_USER_FOLLOWS;
  public userReposts: RetweetDto[] = MOCK_TWITTER_SERVICE_USER_REPOSTS;

  public setUserFollows(userFollows: UserFollowDto[]): void {
    this.userFollows = userFollows;
  }

  public setUserReposts(userReposts: RetweetDto[]): void {
    this.userReposts = userReposts;
  }

  getTwitterId(): Promise<string> {
    if (!this.authToken) {
      throw new Error('Auth token not set');
    }

    return Promise.resolve(MOCK_TWITTER_SERVICE_TWITTER_ID);
  }

  getAuthUrl(): GetAuthUrlDto {
    return {
      url: MOCK_TWITTER_SERVICE_CALLBACK_URL,
      codeVerifier: MOCK_TWITTER_SERVICE_CODE_VERIFIER,
      state: MOCK_TWITTER_SERVICE_STATE,
    };
  }

  getAccessToken(
    code: string,
    codeVerifier: string,
  ): Promise<GetAccessTokenResponseDto> {
    return Promise.resolve({
      accessToken: MOCK_TWITTER_SERVICE_ACCESS_TOKEN,
      refreshToken: MOCK_TWITTER_SERVICE_REFRESH_TOKEN + Math.random() * 100,
      expiresIn: 3600,
    } as GetAccessTokenResponseDto);
  }
  refreshToken(refreshToken: string): Promise<GetAccessTokenResponseDto> {
    if (!refreshToken.includes(MOCK_TWITTER_SERVICE_REFRESH_TOKEN)) {
      throw new Error('Invalid refresh token');
    }

    return Promise.resolve({
      accessToken: MOCK_TWITTER_SERVICE_ACCESS_TOKEN,
      refreshToken: MOCK_TWITTER_SERVICE_REFRESH_TOKEN + Math.random() * 100,
      expiresIn: 3600,
    } as GetAccessTokenResponseDto);
  }

  getUserFollows(twitterId: string): Promise<UserFollowDto[]> {
    if (twitterId !== MOCK_TWITTER_SERVICE_TWITTER_ID) {
      throw new Error('Invalid twitter ID');
    }

    return Promise.resolve(this.userFollows);
  }

  getUserReposts(twitterId: string): Promise<RetweetDto[]> {
    if (twitterId !== MOCK_TWITTER_SERVICE_TWITTER_ID) {
      throw new Error('Invalid twitter ID');
    }

    return Promise.resolve(this.userReposts);
  }

  getUserIdByUsername(username: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  getTweetId(url: string): string | undefined {
    return undefined;
  }

  extractUsernameFromUrl(url: string): string | undefined {
    return undefined;
  }
}
