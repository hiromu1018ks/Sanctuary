"use client";

import { useEffect, useState } from "react";

interface HonoPostResponse {
  id: string;
  content: string;
  createdAt: string;
  userProfile: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
}

// 投稿データの型定義
interface Post {
  post_id: string;
  content: string;
  created_at: string;
  user: {
    user_id: string;
    nickname: string;
    profile_image_url: string | null;
  } | null;
}

// カスタムフックの返却値の型定義
interface UsePostsTimelineReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 投稿タイムライン取得用カスタムフック
export const usePostsTimeline = (): UsePostsTimelineReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 投稿一覧を取得する関数
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/posts");

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      const data: HonoPostResponse[] = await response.json();

      const transformedPosts: Post[] = data.map(item => ({
        post_id: item.id,
        content: item.content,
        created_at: item.createdAt,
        user: {
          user_id: item.userProfile.user.id,
          nickname:
            item.userProfile.displayName ||
            item.userProfile.user.name ||
            "匿名ユーザー",
          profile_image_url:
            item.userProfile.avatarUrl || item.userProfile.user.image,
        },
      }));
      setPosts(transformedPosts);
    } catch (err) {
      setError("投稿の取得に失敗しました");
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時に投稿一覧を取得
  useEffect(() => {
    fetchPosts();
  }, []);

  // 投稿一覧を再取得する関数
  const refetch = async () => {
    await fetchPosts();
  };

  // フックの返却値
  return {
    posts,
    loading,
    error,
    refetch,
  };
};
