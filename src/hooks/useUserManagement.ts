"use client";

import { useCallback, useEffect, useState } from "react";

// ユーザー管理用の型定義
interface User {
  id: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  nickname: string;
  selfIntroduction: string | null;
  gratitudePoints: number;
  currentTreeStage: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    emailVerified: string | null;
  };
  _count: {
    posts: number;
    reactions: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  requestedBy: string;
}

// ユーザー管理用のカスタムフック
export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // ユーザー一覧を取得する関数
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 管理APIからユーザー一覧を取得
      const response = await fetch("http://localhost:3001/api/admin/users", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // レスポンスが正常でない場合はエラーを投げる
      if (!response.ok) {
        throw new Error("ユーザー一覧の取得に失敗しました");
      }

      // ユーザー一覧データをステートにセット
      const data: UsersResponse = await response.json();
      setUsers(data.users);
    } catch (error) {
      // エラー発生時は内容をログ出力し、エラーメッセージをセット
      console.error("Users fetch error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "ユーザー一覧の取得に失敗しました"
      );
    } finally {
      // ローディング状態を解除
      setLoading(false);
    }
  }, []);

  // ユーザーのステータスを更新する関数
  const updateUserStatus = useCallback(
    async (userId: string, status: "pending" | "approved" | "rejected") => {
      try {
        setUpdating(userId); // 更新中のユーザーIDをセット
        setError(null); // エラー状態を初期化

        // 管理APIへステータス更新リクエストを送信
        const response = await fetch(
          `http://localhost:3001/api/admin/users/${userId}/status`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );

        // レスポンスが正常でない場合はエラーを投げる
        if (!response.ok) {
          throw new Error("ステータスの更新に失敗しました");
        }

        // 更新結果を取得
        const data = await response.json();

        // 対象ユーザーのステータスと更新日時をローカルで更新
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, status, updatedAt: new Date().toISOString() }
              : user
          )
        );

        // 成功時のメッセージを返す
        return { success: true, message: data.message };
      } catch (error) {
        // エラー発生時は内容をログ出力し、エラーメッセージをセット
        console.error("User status update error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "ステータスの更新に失敗しました";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setUpdating(null); // 更新中状態を解除
      }
    },
    []
  );

  // 初回レンダリング時にユーザー一覧を取得
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // フックが返す値
  return {
    users,
    loading,
    error,
    updating,
    refetch: fetchUsers,
    updateUserStatus,
  };
}
