import {
  GetAccessTokenResponseDto,
  RetweetDto,
  UserFollowDto,
  GetAuthUrlDto,
} from '../dto';

export abstract class TwitterBaseService {
  protected authToken: string;

  public setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  abstract getTwitterId(): Promise<string>;

  abstract getAuthUrl(): GetAuthUrlDto;

  abstract getAccessToken(
    code: string,
    codeVerifier: string,
  ): Promise<GetAccessTokenResponseDto>;

  abstract refreshToken(
    refreshToken: string,
  ): Promise<GetAccessTokenResponseDto | undefined>;

  abstract getUserFollows(twitterId: string): Promise<UserFollowDto[]>;

  abstract getUserReposts(twitterId: string): Promise<RetweetDto[]>;

  abstract extractUsernameFromUrl(url: string): string | undefined;

  abstract getUserIdByUsername(username: string): Promise<string | undefined>;

  abstract getTweetId(url: string): string | undefined;
}
