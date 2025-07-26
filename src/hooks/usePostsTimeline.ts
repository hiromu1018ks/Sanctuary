interface Post {
  post_id: string;
  content: string;
  created_at: string;
  users: {
    user_id: string;
    nickname: string;
    profile_image_url: string | null;
  };
}

interface UsePostsTimelineReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePostsTimeline = (): UsePostsTimelineReturn => {};
