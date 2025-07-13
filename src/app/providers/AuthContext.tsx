"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { client } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// アプリケーション全体で認証状態を共有するためのコンテキスト型定義
// propsドリリングを避け、どのコンポーネントからでも認証情報にアクセス可能にする
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// undefinedを初期値とすることで、Provider外での使用を検出可能にする
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証状態をアプリケーション全体で一元管理し、リアルタイムで同期する
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // 初期認証状態確認中にローディング画面を表示するため
  const [loading, setLoading] = useState(true);

  const supabase = client;

  useEffect(() => {
    // Supabaseの認証状態変更（ログイン、ログアウト、トークン更新）を
    // リアルタイムで監視し、アプリケーション全体の認証状態を同期する
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // メモリリークを防ぐためのクリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストへの安全なアクセスを提供するカスタムフック
 * Provider外での使用を防ぎ、型安全性を保証する
 */
export function useAuth() {
  const context = useContext(AuthContext);

  // Provider外での使用を検出し、開発者に適切なエラーメッセージを提供
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
}
