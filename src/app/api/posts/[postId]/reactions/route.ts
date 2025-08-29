import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.SANCTUARY_API_URL || "http://localhost:3001";

/**
 * GET /api/posts/[postId]/reactions
 * 投稿のリアクション情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // パラメータから投稿IDを取得
    const { postId } = await params;
    // 投稿IDをログに出力
    console.log(`[API Route] GET リアクション取得: ${postId}`);

    // 外部APIからリアクション情報を取得
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // レスポンスが正常でない場合はエラーを返す
    if (!response.ok) {
      console.warn(`[API Route] sanctuary-api エラー: ${response.status}`);
      return NextResponse.json(
        {
          error: "Failed to fetch reactions",
          status: response.status,
        },
        { status: response.status }
      );
    }

    // レスポンスデータをJSONとして取得
    const data = await response.json();
    // 成功時のログ出力
    console.log(`[API Route] リアクション取得成功:`, data);
    // 取得したデータを返す
    return NextResponse.json(data);
  } catch (error) {
    // 例外発生時のエラーログと500エラーを返す
    console.error("[API Route] リアクション取得エラー:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[postId]/reactions
 * リアクションの追加/削除
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // パラメータから投稿IDを取得
    const { postId } = await params;
    // リクエストボディをJSONとして取得
    const body = await request.json();
    // 操作ログ出力
    console.log(`[API Route] POST リアクション操作: ${postId}`, body);
    // reactionTypeが指定されていない場合はエラーを返す
    if (!body.reactionType) {
      return NextResponse.json(
        {
          error: "reactionType is required",
        },
        { status: 400 }
      );
    }

    // sanctuary-apiにPOSTリクエストを送信してリアクションを追加/削除
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: 認証が必要な場合はトークンを追加
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // APIからエラーが返された場合
      console.warn(`[API Route] sanctuary-api エラー: ${response.status}`);
      const errorData = await response.text(); // エラーメッセージを取得
      return NextResponse.json(
        {
          error: "Failed to toggle reaction",
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json(); // 成功時のレスポンスデータを取得
    console.log(`[API Route] リアクション操作成功:`, data); // 成功ログ出力
    return NextResponse.json(data); // クライアントに結果を返す
  } catch (error) {
    console.error("[API Route] リアクション操作エラー:", error); // 例外発生時のエラーログ
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
