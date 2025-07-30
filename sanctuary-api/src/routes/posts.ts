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

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: body.user_id },
    });

    if (!userProfile) {
      return c.json({ error: "UserProfile not found" }, 404);
    }

    // postsテーブルに新しい投稿を作成
    const post = await prisma.post.create({
      data: {
        userProfileId: userProfile.id,
        content: body.content,
      },
    });

    // 現時点では即座に承認
    // TODO: AIレビューや承認フローを実装する
    const approvedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
        aiReviewPassed: true, // AIレビューが通過したと仮定
      },
    });

    return c.json(approvedPost, 201);
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
    const posts = await prisma.post.findMany({
      where: {
        status: "approved",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        userProfile: {
          include: {
            user: true,
          },
        },
      },
    });
    return c.json(posts);
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("Error fetching posts", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// 投稿を承認するエンドポイント
app.put("/:id/approve", async c => {
  try {
    const id = c.req.param("id");

    // 指定IDの投稿をデータベースから取得
    const existingPost = await prisma.post.findUnique({
      where: { id: id },
    });

    // 投稿が存在しない場合は404を返す
    if (!existingPost) {
      return c.json({ error: "Post not found" }, 404);
    }

    // すでに承認済みの場合はエラーを返す
    if (existingPost.status === "approved") {
      return c.json(
        { error: "Post is already approved", post: existingPost },
        200
      );
    }

    // 投稿のstatusを"approved"に更新し、承認日時とAIレビュー通過フラグを設定
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        status: "approved",
        approvedAt: new Date(),
        aiReviewPassed: true, // AIレビューが通過したと仮定
      },
    });
    return c.json(
      { message: "Post approved successfully", post: updatedPost },
      200
    );
  } catch (error) {
    // 予期しないエラー発生時は500を返す
    console.error("Error approving post:", error);
    return c.json({ error: "Failed to approve post" }, 500);
  }
});

// 指定されたIDの投稿を削除するエンドポイント
app.delete("/:id", async c => {
  try {
    const id = c.req.param("id");

    // 指定IDの投稿が存在するか確認
    const existingPost = await prisma.post.findUnique({
      where: { id: id },
    });

    // 投稿が存在しない場合は404エラーを返す
    if (!existingPost) {
      return c.json({ error: "Post not found" }, 404);
    }

    // 投稿をデータベースから削除
    await prisma.post.delete({
      where: { id: id },
    });

    // 削除成功時のレスポンス
    return c.json({ message: "Post deleted successfully" }, 200);
  } catch (error) {
    // 削除処理中にエラーが発生した場合のエラーハンドリング
    console.error("Error deleting post:", error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export default app;
