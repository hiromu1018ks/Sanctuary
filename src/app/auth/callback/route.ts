// Supabaseのサーバーサイドクライアントを作成する関数をインポート
import { createClient } from "@/lib/supabase/server";
// Next.jsのレスポンスオブジェクトをインポート
import { NextResponse } from "next/server";

/**
 * OAuth認証のコールバック処理を行うGETリクエストハンドラー
 * ユーザーが外部認証プロバイダー（Google、GitHubなど）で認証を完了した後、
 * このエンドポイントにリダイレクトされて認証コードを処理する
 */
export async function GET(request: Request) {
  // リクエストURLからオリジン（例: https://example.com）と検索パラメータを抽出
  const { searchParams, origin } = new URL(request.url);

  // 認証プロバイダーから送信された認証コードを取得
  // このコードを使ってセッションを確立する
  const code = searchParams.get("code");

  // 認証コードが存在する場合の処理
  if (code) {
    // Supabaseクライアントを作成（サーバーサイドでの認証処理用）
    const supabase = await createClient();

    // 認証コードを使ってセッションを確立
    // exchangeCodeForSessionメソッドが認証コードを有効なセッションに変換
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // 認証が成功した場合（エラーが発生しなかった場合）
    if (!error) {
      // OAuth認証で取得したユーザー情報をアプリケーション独自のデータベースに保存する処理
      if (data.user) {
        // 認証されたユーザーの基本情報を分割代入で取得
        // id: Supabaseが生成するユーザーの一意識別子（UUID形式）
        // email: ユーザーのメールアドレス
        // user_metadata: 認証プロバイダーから取得したユーザーの追加情報
        const { id, email, user_metadata } = data.user;

        // usersテーブルにユーザー情報をupsert（新規作成または更新）
        const { error: dbError } = await supabase.from("users").upsert(
          {
            // user_id: Supabaseの認証システムから取得したユーザーID
            user_id: id,
            // email: ユーザーのメールアドレスをそのまま保存
            email: email,
            // nickname: ユーザーの表示名を設定
            // user_metadata?.full_name が存在する場合はその値を使用
            // 存在しない場合は「未設定」をデフォルト値として設定
            // オプショナルチェーニング（?.）で安全にプロパティにアクセス
            nickname: user_metadata?.full_name || "未設定",
            // profile_image_url: ユーザーのプロフィール画像URL
            // user_metadata?.avatar_url が存在する場合はその値を使用
            // 存在しない場合はnullを設定（データベースでNULL値として保存）
            profile_image_url: user_metadata?.avatar_url || null,
          },
          {
            // onConflict: 重複が発生した場合の処理を指定
            // "user_id"フィールドで重複が検出された場合、
            // 既存のレコードを新しいデータで更新する
            onConflict: "user_id",
          }
        );

        // データベースへの保存処理でエラーが発生した場合の処理
        if (dbError) {
          // エラー内容をコンソールに出力してデバッグ情報を記録
          console.log("Error saving user to DB:", dbError);
          // ユーザーをエラーページにリダイレクト
          // originは現在のドメイン（例: https://example.com）
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // データベースへの保存が成功した場合の処理
        // 成功メッセージとユーザーの基本情報をコンソールに出力
        console.log("User saved to DB successfully:", { id, email });
      }
      // リダイレクト先のパスを取得（デフォルトは "/"）
      // "next" パラメータで認証後の遷移先を指定可能
      const next = searchParams.get("next") ?? "/";

      // 成功メッセージとリダイレクト先をログに出力
      console.log("Success! Redirecting to:", `${origin}${next}`);

      // 認証成功後、指定されたページにリダイレクト
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 認証コードが存在しない、または認証に失敗した場合の処理
  console.log("Error case, redirecting to error page");

  // エラーページにリダイレクト
  // 認証に失敗した場合やコードが不正な場合はこのページに誘導
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
