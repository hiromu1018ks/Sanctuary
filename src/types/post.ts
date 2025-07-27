export interface Post {
  post_id: string;
  content: string;
  created_at: string;
  user: {
    user_id: string;
    nickname: string;
    profile_image_url: string | null;
  } | null;
}
