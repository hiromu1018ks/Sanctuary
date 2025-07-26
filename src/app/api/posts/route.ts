import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
const autoApproveMVP = async (
  supabase: SupabaseClient,
  userId: string,
  contentTrimmed: string
) => {
  await supabase
    .from("posts")
    .update({
      status: POST_STATUS.APPROVED,
      approved_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("content", contentTrimmed)
    .eq("status", POST_STATUS.PENDING);
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
    // Supabaseクライアントを生成
    const supabase = await createClient();

    // 認証済みユーザーを取得
    const user = await getAuthenticatedUser(supabase);

    // リクエストボディから投稿内容を取得
    const { content } = await request.json();

    // 投稿内容をバリデーション
    validatePostContent(content);

    const contentTrimmed = content.trim();

    // postsテーブルに新規投稿を挿入
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: contentTrimmed,
      status: POST_STATUS.PENDING,
    });

    // TODO: MVP期間中は、pending投稿が即座にapprovedに自動変更される
    if (!error) {
      await autoApproveMVP(supabase, user.id, contentTrimmed);
    }

    if (error) {
      return createErrorResponse(error.message, 500);
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
