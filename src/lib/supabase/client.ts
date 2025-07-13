import { createBrowserClient } from "@supabase/ssr";

// 環境変数からSupabaseの接続情報を取得
// NEXT_PUBLIC_プレフィックスによりブラウザ側でアクセス可能
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// アプリケーション全体で共有するSupabaseクライアントインスタンスを作成
// ブラウザ環境専用のクライアントを使用してSSR環境での問題を回避
export const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
