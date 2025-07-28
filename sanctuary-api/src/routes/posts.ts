import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";

const app = new Hono();
const prisma = new PrismaClient();

// 新規投稿を作成するエンドポイント
app.post("/", async c => {
  try {
    const body = await c.req.json();

    // 必須パラメータのバリデーション
    if (!body.user_id || !body.content) {
      return c.json({ error: "user_id and content are required" }, 400);
    }

    // postsテーブルに新しい投稿を作成
    const post = await prisma.posts.create({
      data: {
        user_id: body.user_id,
        content: body.content,
      },
    });

    return c.json(post, 201);
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("Error creating post", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// 承認済みの稿一覧を取得するエンドポイント
app.get("/", async c => {
  try {
    // postsテーブルからstatusがapprovedの投稿を新しい順に取得
    const posts = await prisma.posts.findMany({
      where: {
        status: "approved",
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        users: true, // 投稿者情報も含めて取得
      },
    });
    return c.json(posts);
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("Error fetching posts", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

app.put("/:id/approve", async c => {
  try {
    const id = c.req.param("id");

    const existingPost = await prisma.posts.findUnique({
      where: { post_id: id },
    });

    if (!existingPost) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (existingPost.status === "approved") {
      return c.json(
        { error: "Post is already approved", post: existingPost },
        200
      );
    }

    const updatedPost = await prisma.posts.update({
      where: { post_id: id },
      data: {
        status: "approved",
        approved_at: new Date(),
        ai_review_passed: true, // AIレビューが通過したと仮定
      },
    });
    return c.json(
      { message: "Post approved successfully", post: updatedPost },
      200
    );
  } catch (error) {
    console.error("Error approving post:", error);
    return c.json({ error: "Failed to approve post" }, 500);
  }
});
