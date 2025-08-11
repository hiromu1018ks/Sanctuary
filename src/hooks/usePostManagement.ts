"use client";

import { useCallback, useEffect, useState } from "react";

// 投稿データの型定義
interface Post {
  id: string; // 投稿ID
  content: string; // 投稿内容
  templateType: string | null; // テンプレート種別（null可）
  status: "pending" | "approved" | "rejected"; // 投稿ステータス
  aiReviewPassed: boolean | null; // AI審査通過フラグ（null可）
  reviewReason: string | null; // 審査理由（null可）
  approvedAt: string | null; // 承認日時（null可）
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
  userProfile: {
    // 投稿者プロフィール
    id: string; // プロフィールID
    nickname: string; // ニックネーム
    user: {
      // ユーザー情報
      id: string; // ユーザーID
      name: string | null; // ユーザー名（null可）
      email: string | null; // メールアドレス（null可）
    };
  };
}

// APIレスポンスの型定義
interface PostsResponse {
  posts: Post[]; // 投稿一覧
  pagination: {
    // ページネーション情報
    total: number; // 総件数
    hasNextPage: boolean; // 次ページ有無
    nextCursor: string | null; // 次ページカーソル（null可）
  };
}

// 投稿管理用のカスタムフック
export function usePostManagement() {
  // 投稿一覧の状態
  const [posts, setPosts] = useState<Post[]>([]);
  // 投稿一覧取得中のローディング状態
  const [loading, setLoading] = useState(true);
  // エラー内容
  const [error, setError] = useState<string | null>(null);
  // 投稿更新中（削除中）の投稿ID
  const [updating, setUpdating] = useState<string | null>(null);

  // 投稿一覧を取得する関数
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 投稿一覧APIを呼び出し
      const response = await fetch("http://localhost:3001/api/posts?limit=50", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // レスポンスが正常でない場合はエラー
      if (!response.ok) {
        throw new Error("投稿一覧の取得に失敗しました");
      }

      // 投稿データを取得して状態にセット
      const data: PostsResponse = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Posts fetch error:", error);
      setError(
        error instanceof Error ? error.message : "投稿一覧の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 投稿を強制削除する関数
  const deletePost = useCallback(async (postId: string) => {
    try {
      setUpdating(postId);
      setError(null);

      // 投稿削除APIを呼び出し
      const response = await fetch(
        `http://localhost:3001/api/admin/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // レスポンスが正常でない場合はエラー
      if (!response.ok) {
        throw new Error("投稿の削除に失敗しました");
      }

      // 削除後のメッセージ取得
      const data = await response.json();

      // 投稿一覧から削除した投稿を除外
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Delete post error:", error);
      // エラー内容を判定してメッセージを設定
      const errorMessage =
        error instanceof Error ? error.message : "投稿の削除に失敗しました";
      return { success: false, message: errorMessage }; // 失敗時の返却値
    } finally {
      setUpdating(null); // 更新中状態を解除
    }
  }, []);

  // 投稿強制承認
  const approvePost = useCallback(async (postId: string) => {
    try {
      setUpdating(postId); // 更新中の投稿IDをセット
      setError(null); // エラー状態をクリア

      // 管理者による投稿承認APIを呼び出し
      const response = await fetch(
        `http://localhost:3001/api/admin/posts/${postId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // 承認失敗時はエラーを投げる
        throw new Error("投稿の承認に失敗しました");
      }

      const data = await response.json();

      // 投稿リストの該当投稿を承認済みに更新
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                status: "approved", // 承認済みステータス
                aiReviewPassed: true, // AI審査通過
                approvedAt: new Date().toISOString(), // 承認日時
                reviewReason: "管理者により強制承認", // 承認理由
              }
            : post
        )
      );

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Approve post error:", error);
      // エラー内容を判定してメッセージを設定
      const errorMessage =
        error instanceof Error ? error.message : "投稿の承認に失敗しました";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setUpdating(null); // 更新中状態を解除
    }
  }, []);

  // 投稿一覧取得時にfetchPostsを実行（初回・依存関係変更時）
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // カスタムフックが返す値・関数一覧
  return {
    posts, // 投稿一覧
    loading, // ローディング状態
    error, // エラー内容
    updating, // 更新中の投稿ID
    refetchPosts: fetchPosts, // 投稿一覧再取得関数
    deletePost, // 投稿削除関数
    approvePost, // 投稿承認関数
  };
}
