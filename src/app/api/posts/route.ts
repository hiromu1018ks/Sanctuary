import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const POST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
} as const;

const VALIDATION_LIMITS = {
  MAX_CONTENT_LENGTH: 500,
} as const;

/**
 * エラーレスポンスを生成するユーティリティ関数
 * @param message エラーメッセージ
 * @param status HTTPステータスコード
 */
const createErrorResponse = (message: string, status: number) => {
  return new NextResponse(
    JSON.stringify({
      error: message,
    }),
    { status }
  );
};

/**
 * 認証済みユーザーを取得する
 * @param supabase Supabaseクライアントインスタンス
 * @returns 認証済みユーザー情報
 * @throws 認証されていない場合にエラーを投げる
 */
const getAuthenticatedUser = async (
  supabase: SupabaseClient
): Promise<User> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("認証が必要です");
  }

  return user;
};

/**
 * 投稿内容のバリデーションを行う
 * - 空文字や500文字超の場合はエラーを投げる
 */
const validatePostContent = (content: string): void => {
  if (!content || content.trim().length == 0) {
    throw new Error("投稿内容を入力してください");
  }

  if (content.length > VALIDATION_LIMITS.MAX_CONTENT_LENGTH) {
    throw new Error(
      `投稿内容は${VALIDATION_LIMITS.MAX_CONTENT_LENGTH}文字以内で入力してください`
    );
  }
};

/**
   * MVP期間中の自動承認処理
   * pending状態の投稿を即座にapproved
  に変更
   */
const autoApproveMVP = async (supabase: SupabaseClient, postId: string) => {
  console.log("Calling auto_approve_post with postId:", postId);

  const { data, error } = await supabase.rpc("auto_approve_post", {
    post_id_param: postId,
  });

  console.log("RPC result - data:", data, "error:", error);

  if (error) {
    throw error;
  }
};

/**
 * 投稿作成API
 * 1. Supabaseクライアント生成
 * 2. 認証ユーザー取得
 * 3. 投稿内容のバリデーション
 * 4. postsテーブルへ挿入
 * 5. エラーごとに適切なレスポンスを返す
 */
export async function POST(request: Request) {
  try {
    console.log("=== 投稿API開始 ===");

    // Authorization ヘッダーからJWTトークンを取得
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse("認証が必要です", 401);
    }

    // 通常のSupabaseクライアントを作成
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // JWTを手動で設定
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    console.log("✅ Supabaseクライアント作成完了");

    // 認証済みユーザーを取得
    const user = await getAuthenticatedUser(supabase);
    console.log("✅ 認証ユーザー取得完了:", user.id);

    // リクエストボディから投稿内容を取得
    const { content } = await request.json();
    console.log("✅ リクエストボディ取得完了");

    // 投稿内容をバリデーション
    validatePostContent(content);
    console.log("✅ バリデーション完了");

    const contentTrimmed = content.trim();

    console.log("=== INSERT開始 ===");
    console.log("INSERT前の詳細情報:");
    console.log("user.id:", user.id);
    console.log("user.id type:", typeof user.id);
    console.log("=== JWT確認 ===");
    const { data: session } = await supabase.auth.getSession();
    console.log(
      "現在のsession:",
      session.session?.access_token ? "存在" : "なし"
    );
    console.log("JWT user:", session.session?.user?.id);

    // auth.uid()をRPCで直接確認
    const { data: authUid } = await supabase.rpc("auth.uid");
    console.log("RPC auth.uid():", authUid);

    // postsテーブルに新規投稿を挿入
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: contentTrimmed,
        status: POST_STATUS.PENDING,
      })
      .select();

    console.log("INSERT結果 - data:", data, "error:", error);

    if (!error && data?.[0]) {
      console.log("=== 自動承認開始 ===");
      await autoApproveMVP(supabase, data[0].post_id);
      console.log("✅ 自動承認完了");
    }

    if (error) {
      console.error("Auto approval error:", error);
    }

    return new NextResponse(null, {
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // 認証エラーの場合は401を返す
    if (errorMessage === "認証が必要です") {
      return createErrorResponse(errorMessage, 401);
    }

    // バリデーションエラーの場合は400を返す
    if (errorMessage.includes("投稿")) {
      return createErrorResponse(errorMessage, 400);
    }
    // その他のエラーは500を返す
    return createErrorResponse("Internal Server Error", 500);
  }
}
