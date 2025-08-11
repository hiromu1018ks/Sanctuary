"use client";

import { useEffect, useState } from "react";

// ダッシュボード統計情報の型定義
interface DashboardStats {
  totalUsers: number; // 総ユーザー数
  totalPosts: number; // 総投稿数
  pendingPosts: number; // 承認待ち投稿数
  approvedPosts: number; // 承認済み投稿数
  rejectedPosts: number; // 拒否された投稿数
}

// 投稿の型定義
interface Post {
  id: string; // 投稿ID
  status: "pending" | "approved" | "rejected"; // 投稿ステータス
  content: string; // 投稿内容
  createdAt: string; // 作成日時
  userProfile: {
    id: string; // プロフィールID
    nickname: string; // ニックネーム
    user: {
      id: string; // ユーザーID
      name: string | null; // ユーザー名
      email: string | null; // メールアドレス
    };
  };
}

// APIレスポンスの型定義（ユーザー一覧）
interface UsersApiResponse {
  users: Array<{
    id: string; // ユーザーID
    role: string; // ユーザー権限
    status: string; // ユーザーステータス
    user: {
      id: string; // ユーザーID
      name: string | null; // ユーザー名
      email: string | null; // メールアドレス
    };
  }>;
  total: number; // 総ユーザー数
}

// APIレスポンスの型定義（投稿一覧）
interface PostsApiResponse {
  posts: Post[]; // 投稿一覧
  pagination: {
    total: number; // 総投稿数
    hasNextPage: boolean; // 次ページ有無
    nextCursor: string | null; // 次ページカーソル
  };
}

// 管理者ダッシュボード用カスタムフック
export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null); // 統計情報
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラー情報

  useEffect(() => {
    fetchDashboardStats(); // 初回マウント時に統計情報取得
  }, []);

  // ダッシュボード統計情報取得関数
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 並列でユーザー一覧と投稿一覧を取得
      const [usersResponse, postsResponse] = await Promise.all([
        fetch("http://localhost:3001/api/admin/users", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:3001/api/posts", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      // レスポンスが正常でない場合はエラー
      if (!usersResponse.ok || !postsResponse.ok) {
        throw new Error("統計情報の取得に失敗しました");
      }

      // レスポンスデータをパース
      const usersData: UsersApiResponse = await usersResponse.json();
      const postsData: PostsApiResponse = await postsResponse.json();

      // 投稿状態別の集計
      const posts = postsData.posts || [];
      const pendingPosts = posts.filter(
        (post: Post) => post.status === "pending"
      ).length;
      const approvedPosts = posts.filter(
        (post: Post) => post.status === "approved"
      ).length;
      const rejectedPosts = posts.filter(
        (post: Post) => post.status === "rejected"
      ).length;

      // 統計情報をセット
      setStats({
        totalUsers: usersData.total,
        totalPosts: posts.length,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
      });
    } catch (error) {
      // エラー処理
      console.error("Dashboard stats fetch error:", error);
      setError(
        error instanceof Error ? error.message : "統計情報の取得に失敗しました"
      );
    } finally {
      setLoading(false); // ローディング終了
    }
  };
  return {
    stats, // 統計情報
    loading, // ローディング状態
    error, // エラー情報
    refetch: fetchDashboardStats, // 再取得関数
  };
}
