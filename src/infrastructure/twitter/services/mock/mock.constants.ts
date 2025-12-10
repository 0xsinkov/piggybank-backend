import { RetweetDto, UserFollowDto } from '../../dto';

export const MOCK_TWITTER_SERVICE_CALLBACK_URL =
  'http://localhost:3000/api/twitter/auth-callback';
export const MOCK_TWITTER_SERVICE_CODE_VERIFIER = 'mockCodeVerifier';
export const MOCK_TWITTER_SERVICE_STATE = 'mockState';
export const MOCK_TWITTER_SERVICE_ACCESS_TOKEN = 'mockAccessToken';
export const MOCK_TWITTER_SERVICE_REFRESH_TOKEN = 'mockRefreshToken';

export const MOCK_TWITTER_SERVICE_TWITTER_ID = 'mockTwitterId';

export const MOCK_TWITTER_SERVICE_USER_FOLLOWS: UserFollowDto[] = [
  {
    id: 'mockTwitterId1',
    name: 'mockUserName1',
    username: 'mockUserName1',
  },
  {
    id: 'mockTwitterId2',
    name: 'mockUserName2',
    username: 'mockUserName2',
  },
];

export const MOCK_TWITTER_SERVICE_USER_REPOSTS: RetweetDto[] = [
  {
    id: 'mockTweetId1',
    authorId: 'mockTwitterId1',
    text: 'mockTweetText1',
    createdAt: new Date(),
    retweetId: 'mockTwitterId2',
  },
  {
    id: 'mockTweetId2',
    authorId: 'mockTwitterId2',
    text: 'mockTweetText2',
    createdAt: new Date(),
    retweetId: 'mockTwitterId3',
  },
  {
    id: 'mockTweetId3',
    authorId: 'mockTwitterId3',
    text: 'mockTweetText3',
    createdAt: new Date(),
    retweetId: 'mockTwitterId4',
  },
];
