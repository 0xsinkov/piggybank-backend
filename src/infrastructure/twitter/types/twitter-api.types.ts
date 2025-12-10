export interface PostRepost {
  author_id: string;
  created_at: string;
  id: string;
  text: string;
  username: string;
}

export interface PostLike {
  created_at: string;
  id: string;
  name: string;
  protected: boolean;
  username: string;
}

export interface TwitterResponse<T> {
  data: T;
}
