"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { client } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// 認証コンテキストの型定義
// アプリケーション全体で共有される認証情報の構造を定義
interface AuthContextType {
  user: User | null; // 現在ログイン中のユーザー情報（未ログイン時はnull）
  session: Session | null; // 現在のセッション情報（未ログイン時はnull）
  loading: boolean; // 認証状態の読み込み中かどうかを示すフラグ
}

// React Contextを作成
// アプリケーション全体で認証情報を共有するためのコンテキスト
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーコンポーネント
// アプリケーション全体に認証情報を提供する役割を持つ
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 現在のユーザー情報を管理するstate
  const [user, setUser] = useState<User | null>(null);
  // 現在のセッション情報を管理するstate
  const [session, setSession] = useState<Session | null>(null);
  // 認証状態の読み込み状況を管理するstate
  const [loading, setLoading] = useState(true);

  // Supabaseクライアントインスタンスを取得
  // 認証機能にアクセスするためのクライアント
  const supabase = client;

  // コンポーネントマウント時に実行される副作用フック
  useEffect(() => {
    // Supabaseの認証状態変更を監視するリスナーを設定
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // セッション情報をstateに保存
      setSession(session);
      // セッションが存在する場合はユーザー情報を設定、存在しない場合はnullを設定
      setUser(session?.user || null);
      // 読み込み完了を示すためloadingをfalseに設定
      setLoading(false);
    });

    // コンポーネントアンマウント時のクリーンアップ処理
    // メモリリークを防ぐためにリスナーの登録を解除
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]); // supabaseインスタンスが変更された場合のみ再実行

  return (
    // AuthContext.Providerコンポーネントを返す
    // このProviderは、認証に関するデータ（user, session, loading）を
    // 子コンポーネントツリー全体に提供する役割を持つ
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを取得するカスタムフック
 * このフックを使用することで、コンポーネント内で認証状態にアクセスできる
 */
export function useAuth() {
  // useContextを使用してAuthContextの値を取得
  const context = useContext(AuthContext);

  // contextがundefinedの場合、AuthProvider外で使用されていることを意味する
  if (context === undefined) {
    // エラーを投げることで、不正な使用を防ぐ
    // この仕組みにより、useAuthは必ずAuthProvider内でのみ使用されることが保証される
    throw new Error("useAuth must be used within a AuthProvider");
  }

  // 認証コンテキストの値（user, session, loading）を返す
  return context;
}
