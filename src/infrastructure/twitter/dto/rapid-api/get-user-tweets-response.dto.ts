export class GetUserTweetsResponseDto {
  tweet_id: string;
  creation_date: string;
  user: {
    user_id: string;
    name: string;
    username: string;
  };
  text: string;
  retweet_tweet_id?: string;
}
