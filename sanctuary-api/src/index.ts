import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma";
import { errorHandler } from "./middleware/errorHandler";
import { loggerMiddleware } from "./middleware/logger";
import { corsMiddleware } from "./middleware/cors";

import postRouter from "./routes/posts";
import profileRouter from "./routes/profile";

// Honoアプリケーションのインスタンスを作成
const app = new Hono();
// Prismaクライアントのインスタンスを作成（DB接続用）
const prisma = new PrismaClient();

// 共通エラーハンドラーを全ルートに適用
app.use("*", errorHandler);
// ログ出力ミドルウェアを全ルートに適用
app.use("*", loggerMiddleware);
// CORSミドルウェアを全ルートに適用
app.use("*", corsMiddleware);

// ルートパスにアクセスした際のレスポンス
app.get("/", c => {
  return c.text("Hello Sanctuary API!");
});

// DB接続テスト用エンドポイント
app.get("/test-db", async c => {
  try {
    // ユーザー数と投稿数を取得
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();

    // 取得結果をJSONで返す
    return c.json({
      message: "Database connection successful!",
      data: {
        users: userCount,
        posts: postCount,
      },
    });
  } catch {
    // DB接続失敗時のエラーレスポンス
    return c.json({ error: "Failed to connect to the database" }, 500);
  }
});

// 投稿APIのルーティング
app.route("/api/posts", postRouter);

// プロフィールAPIのルーティング
app.route("/api/profile", profileRouter);

// サーバー起動ポート番号
const port = 3001;
// サーバー起動ログ出力
console.log(`Server is running on http://localhost:${port}`);

// サーバーを起動
serve({
  fetch: app.fetch,
  port,
});
