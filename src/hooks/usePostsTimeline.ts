"use client";

import { useCallback, useEffect, useState } from "react";

interface HonoPostResponse {
  id: string;
  content: string;
  createdAt: string;
  userProfile: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
}

interface HonoPaginationResponse {
  posts: HonoPostResponse[];
  pagination: {
    limit: number;
    offset: number;
    hasNextPage: boolean;
    nextCursor: string | null;
    totalReturned: number;
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
  loadMore: () => Promise<void>;
  hasNextPage: boolean;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

// 投稿タイムライン取得用カスタムフック
export const usePostsTimeline = (): UsePostsTimelineReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // 新規投稿のみを取得するためのポーリング関数
  const pollForNewPosts = useCallback(async () => {
    try {
      setIsPolling(true);

      const latestPostTime = posts.length > 0 ? posts[0].created_at : null;

      const params = new URLSearchParams();
      params.append("limit", "10");

      if (latestPostTime) {
        params.append("since", latestPostTime);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      const data: HonoPaginationResponse = await response.json();

      const newPosts: Post[] = data.posts.map((item: HonoPostResponse) => ({
        post_id: item.id,
        content: item.content,
        created_at: item.createdAt,
        user: {
          user_id: item.userProfile.user.id,
          nickname:
            item.userProfile.nickname ||
            item.userProfile.user.name ||
            "匿名ユーザー",
          profile_image_url:
            item.userProfile.avatarUrl || item.userProfile.user.image,
        },
      }));

      if (newPosts.length > 0) {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.post_id));
          const uniqueNewPosts = newPosts.filter(
            post => !existingIds.has(post.post_id)
          );
          return [...uniqueNewPosts, ...prevPosts];
        });
      }
    } catch (error) {
      console.error("新規投稿の取得に失敗:", error);
    } finally {
      setIsPolling(false);
    }
  }, [posts]);

  // ボーリングを開始する関数
  const startPolling = useCallback(() => {
    console.log(
      "startPolling called,current pollingInterval:",
      pollingInterval
    );
    console.log("current isPolling:", isPolling);

    if (pollingInterval) return; // 既にポーリング中の場合は何もしない

    const interval = setInterval(() => {
      pollForNewPosts();
    }, 30000);
    console.log("Setting new interval:", interval);
    setPollingInterval(interval);
    setIsPolling(true);
  }, [pollingInterval, pollForNewPosts]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsPolling(false);
    }
  }, [pollingInterval]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 投稿一覧を取得する関数
  const fetchPosts = async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      params.append("limit", "10");

      if (isLoadMore && nextCursor) {
        params.append("cursor", nextCursor);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const data: HonoPaginationResponse = await response.json();

      const transformedPosts: Post[] = data.posts.map(
        (item: HonoPostResponse) => ({
          post_id: item.id,
          content: item.content,
          created_at: item.createdAt,
          user: {
            user_id: item.userProfile.user.id,
            nickname:
              item.userProfile.nickname ||
              item.userProfile.user.name ||
              "匿名ユーザー",
            profile_image_url:
              item.userProfile.avatarUrl || item.userProfile.user.image,
          },
        })
      );

      if (isLoadMore) {
        setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      setHasNextPage(data.pagination?.hasNextPage || false);
      setNextCursor(data.pagination.nextCursor);
    } catch (err) {
      setError("投稿の取得に失敗しました");
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時に投稿一覧を取得
  useEffect(() => {
    fetchPosts(false);
  }, []);

  // 投稿一覧を再取得する関数
  const refetch = async () => {
    setNextCursor(null);
    await fetchPosts(false);
  };

  const loadMore = async () => {
    if (hasNextPage && nextCursor) {
      await fetchPosts(true);
    }
  };

  // フックの返却値
  return {
    posts,
    loading,
    error,
    refetch,
    loadMore,
    hasNextPage,
    isPolling,
    startPolling,
    stopPolling,
  };
};
