"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * 管理者権限チェック用のカスタムフック
 */
export function useAdmin() {
  // セッション情報と認証状態を取得
  const { data: session, status } = useSession();
  // 管理者かどうかの状態
  const [isAdmin, setIsAdmin] = useState(false);
  // ローディング状態
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッション情報取得中の場合は何もしない
    if (status === "loading") {
      return;
    }

    // 未認証またはユーザー情報がない場合は管理者ではない
    if (status === "unauthenticated" || !session?.user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // 管理者権限の確認
    const userRole = session.user.role;
    setIsAdmin(userRole === "admin");
    setLoading(false);
  }, [session, status]);

  // 管理者判定・ローディング状態・ユーザー情報を返す
  return {
    isAdmin,
    loading,
    user: session?.user,
  };
}

/**
 * 管理者のみアクセス可能なコンポーネントをラップするHOC
 */
export function withAdminAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function AdminAuthComponent(props: T) {
    const { isAdmin, loading } = useAdmin();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">認証情報を確認中...</div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              アクセス権限がありません
            </h1>
            <p className="text-gray-600">
              このページは管理者のみアクセス可能です。
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
