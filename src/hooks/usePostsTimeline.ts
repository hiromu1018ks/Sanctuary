"use client";

import { useEffect, useState } from "react";
import { client as supabase } from "@/lib/supabase/client";

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

// Supabaseから取得する投稿データの型定義
interface SupabasePostResponse {
  post_id: string;
  content: string;
  created_at: string;
  users:
    | {
        user_id: string;
        nickname: string;
        profile_image_url: string | null;
      }[]
    | null;
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

      // Supabaseから投稿データを取得
      const { data, error: supabaseError } = await supabase
        .from("posts")
        .select(
          `post_id,
           content,
           created_at,
           users!inner (
            user_id,
            nickname,
            profile_image_url
           )`
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // SupabaseのレスポンスをPost型に変換
        const transformedPosts: Post[] = (data as SupabasePostResponse[]).map(
          item => ({
            post_id: item.post_id,
            content: item.content,
            created_at: item.created_at,
            user: item.users?.[0] || null,
          })
        );
        setPosts(transformedPosts);
      } else {
        setPosts([]);
      }
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
