import { Context, Next } from "hono";

/**
   * 管理者権限チェックのミドルウェア
   *
   * このミドルウェアの動作:
   * 1.
  Next.jsのAPIルートを通じてセッション情報を取得
   * 2. ユーザーのロール情報を確認
   * 3. 管理者権限がない場合はアクセスを拒否
   */
export async function requireAdmin(c: Context, next: Next) {
  try {
    // リクエストヘッダーからCookiesを取得
    const cookieHeader = c.req.header("Cookie");

    if (!cookieHeader) {
      return c.json(
        {
          error: "Unauthorized",
          message: "ログインが必要です",
        },
        401
      );
    }

    // Next.jsのセッションAPIを呼び出してセッション情報を取得
    const sessionResponse = await fetch(
      "http://localhost:3000/api/auth/session",
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!sessionResponse.ok) {
      return c.json(
        {
          error: "Unauthorized",
          message: "認証情報が無効です",
        },
        401
      );
    }

    const session = await sessionResponse.json();

    // セッションが存在しない場合
    if (!session?.user) {
      return c.json(
        {
          error: "Unauthorized",
          message: "ログインが必要です",
        },
        401
      );
    }

    // 管理者権限のチェック
    if (session.user.role !== "admin") {
      return c.json(
        {
          error: "Forbidden",
          message: "管理者権限が必要です",
        },
        403
      );
    }

    // ユーザー情報をコンテキストに追加
    c.set("user", session.user);

    console.log(
      `Admin access granted: ${session.user.email} (${session.user.role})`
    );

    // 次のミドルウェアまたはハンドラーを呼び出す
    await next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return c.json(
      {
        error: "Internal Server Error",
        message: "サーバーエラーが発生しました",
      },
      500
    );
  }
}

// 現在のユーザー情報を取得するヘルパー関数
export function getCurrentUser(c: Context) {
  return c.get("user") as
    | {
        id: string;
        email: string;
        name: string;
        role: string;
      }
    | undefined;
}
