import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";

// 共通エラーハンドリングミドルウェア
// すべてのリクエスト処理で例外をキャッチし、適切なエラーレスポンスを返す
export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    // 次のミドルウェアまたはルートハンドラの実行
    await next();
  } catch (error) {
    // エラー発生時にサーバー側でログ出力
    console.error("Error occurred:", error);

    // HonoのHTTPExceptionの場合は、ステータスコードとメッセージをそのまま返す
    if (error instanceof HTTPException) {
      return c.json(
        {
          error: error.message,
          status: error.status,
        },
        error.status
      );
    }
  }

  // 予期しないエラーの場合は、500エラーとして汎用メッセージを返す
  return c.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    },
    500
  );
};
