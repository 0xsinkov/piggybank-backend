export class GetAccessTokenResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}
