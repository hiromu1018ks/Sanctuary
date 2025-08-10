import "next-auth";

// next-auth モジュールの型定義を拡張
declare module "next-auth" {
  // セッション情報の型定義
  interface Session {
    user: {
      id: string; // ユーザーID
      name?: string | null; // ユーザー名（省略可能）
      email?: string | null; // メールアドレス（省略可能）
      image?: string | null; // プロフィール画像URL（省略可能）
      role: string; // ユーザー権限
    };
  }

  // ユーザー情報の型定義
  interface User {
    id: string; // ユーザーID
    role?: string; // ユーザー権限（省略可能）
  }
}
