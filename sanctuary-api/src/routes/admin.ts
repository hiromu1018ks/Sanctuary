import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";
import { getCurrentUser, requireAdmin } from "../middleware/adminAuth";

// Hono アプリケーションのインスタンスを作成
const app = new Hono();
// Prisma クライアントのインスタンスを作成
const prisma = new PrismaClient();

// 全ての管理者ルートで権限チェックを適用
app.use("*", requireAdmin);

/**
 * 全ユーザー一覧取得（管理者のみ）
 * GET /admin/users
 */
app.get("/users", async c => {
  try {
    // 現在の管理者ユーザー情報を取得
    const currentUser = getCurrentUser(c);
    console.log(`Admin ${currentUser?.email} requested user list`);

    // ユーザー一覧を取得(UserProfileとUserをJOIN)
    const users = await prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            emailVerified: true,
          },
        },
        _count: {
          select: {
            posts: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ユーザー一覧をJSONで返す
    return c.json({
      users,
      total: users.length,
      requestedBy: currentUser?.email,
    });
  } catch (error) {
    // エラー時の処理
    console.error("Get users error:", error);
    return c.json({
      error: "Failed to fetch users",
      message: "ユーザー一覧の取得に失敗しました",
    });
  }
});

/**
 * ユーザーステータス更新（承認・拒否）
 * PATCH /admin/users/:userId/status
 */
app.patch("/users/:userId/status", async c => {
  const userId = c.req.param("userId");
  const currentUser = getCurrentUser(c);

  try {
    // リクエストボディからステータスを取得
    const body = await c.req.json();
    const { status } = body;

    // ステータス値の検証
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return c.json(
        {
          error: "Invalid status",
          message: "無効なステータスです",
          validStatuses,
        },
        400
      );
    }

    // ユーザー存在確認
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!existingUser) {
      // ユーザーが存在しない場合
      return c.json(
        {
          error: "User not found",
          message: "指定されたユーザーが存在しません",
        },
        404
      );
    }

    // ステータス更新
    const updatedUser = await prisma.userProfile.update({
      where: { id: userId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 更新ログ出力
    console.log(
      `Admin ${currentUser?.email} updated user ${existingUser.user.email} status to ${status}`
    );

    // 更新結果を返す
    return c.json({
      user: updatedUser,
      message: `ユーザーステータスを「${status}」に更新しました`,
      updatedBy: currentUser?.email,
    });
  } catch (error) {
    // エラー時の処理
    console.error("Update user status error:", error);
    return c.json(
      {
        error: "Failed to update user status",
        message: "ユーザーステータスの更新に失敗しました",
      },
      500
    );
  }
});

/**
 * 投稿の強制削除（管理者のみ）
 * DELETE /admin/posts/:postId
 */
app.delete("/posts/:postId", async c => {
  const postId = c.req.param("postId");
  const currentUser = getCurrentUser(c);

  try {
    // 投稿存在確認
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        userProfile: {
          include: {
            user: {
              select: { email: true, name: true },
            },
          },
        },
      },
    });

    if (!existingPost) {
      // 投稿が存在しない場合
      return c.json(
        {
          error: "Post not found",
          message: "投稿が見つかりません",
        },
        404
      );
    }

    // 投稿削除
    await prisma.post.delete({
      where: { id: postId },
    });

    // 削除ログ出力
    console.log(
      `Admin ${currentUser?.email} deleted post ${postId} by ${existingPost.userProfile.user.email}`
    );

    // 削除結果を返す
    return c.json({
      message: "投稿を削除しました",
      deletedPost: {
        id: existingPost.id,
        content: existingPost.content.substring(0, 50) + "...",
        author: existingPost.userProfile.user.email,
      },
      deletedBy: currentUser?.email,
    });
  } catch (error) {
    // エラー時の処理
    console.error("Delete post error:", error);
    return c.json(
      {
        error: "Failed to delete post",
        message: "投稿の削除に失敗しました",
      },
      500
    );
  }
});

/**
 * 投稿の強制承認(AI審査をバイパス)
 * PATCH /admin/posts/:postId/approve
 */
app.patch("/posts/:postId/approve", async c => {
  const postId = c.req.param("postId");
  const currentUser = getCurrentUser(c);

  try {
    // 投稿存在確認
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        userProfile: {
          include: {
            user: {
              select: { email: true, name: true },
            },
          },
        },
      },
    });

    if (!existingPost) {
      // 投稿が存在しない場合
      return c.json(
        {
          error: "Post not found",
          message: "投稿が見つかりません",
        },
        404
      );
    }

    // 投稿を強制承認
    const approvedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: "approved",
        aiReviewPassed: true,
        reviewReason: `管理者により強制承認(${currentUser?.email})`,
        approvedAt: new Date(),
      },
    });

    // 承認ログ出力
    console.log(
      `Admin ${currentUser?.email} force-approved post ${postId} by ${existingPost.userProfile.user.email}`
    );

    // 承認結果を返す
    return c.json({
      post: approvedPost,
      message: "投稿を強制承認しました",
      approvedBy: currentUser?.email,
    });
  } catch (error) {
    // エラー時の処理
    console.error("Approve post error:", error);
    return c.json(
      {
        error: "Failed to approve post",
        message: "投稿の承認に失敗しました",
      },
      500
    );
  }
});

// このファイルのエンドポイントをエクスポート
export default app;
