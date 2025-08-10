import { NextResponse, NextRequest } from "next/server";
import { auth } from "../../../../../auth";

// プロフィールAPIのエンドポイントURL
const HONO_PROFILE_API_URL = "http://localhost:3001/api/profile";

// エラーレスポンスを生成するヘルパー関数
const createErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ error: message }, { status });
};

// プロフィール情報の取得処理
export async function GET() {
  try {
    const session = await auth();

    // デバッグ用ログ追加
    console.log("=== Profile API Debug ===");
    console.log("Session:", JSON.stringify(session, null, 2));
    console.log("User ID:", session?.user?.id);
    console.log("========================");
    // 未認証の場合はエラーを返す
    if (!session?.user?.id) {
      return createErrorResponse("認証が必要です", 401);
    }

    // バックエンドAPIからプロフィール情報を取得
    const response = await fetch(`${HONO_PROFILE_API_URL}/me`, {
      headers: {
        "x-user-id": session.user.id,
      },
    });

    // APIレスポンスが正常でない場合はエラーを返す
    if (!response.ok) {
      const errorData = await response.json();
      return createErrorResponse(
        errorData.error || "プロフィール取得に失敗しました",
        response.status
      );
    }

    // 正常時はプロフィール情報を返す
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile API error:", error);
    return createErrorResponse("サーバーエラーが発生しました", 500);
  }
}

// プロフィール情報の更新処理
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    // 未認証の場合はエラーを返す
    if (!session?.user?.id) {
      return createErrorResponse("認証が必要です", 401);
    }

    // リクエストボディを取得
    const body = await request.json();

    // バックエンドAPIへプロフィール情報を更新
    const response = await fetch(`${HONO_PROFILE_API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    // APIレスポンスが正常でない場合はエラーを返す
    if (!response.ok) {
      const errorData = await response.json();
      return createErrorResponse(
        errorData.error || "プロフィール更新に失敗しました",
        response.status
      );
    }

    // 正常時は更新後のプロフィール情報を返す
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile update API error:", error);
    return createErrorResponse("サーバーエラーが発生しました", 500);
  }
}
