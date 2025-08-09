import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";

interface UpdateProfileData {
  nickname?: string;
  selfIntroduction?: string | null;
  profileImageUrl?: string | null;
}

const app = new Hono();
const prisma = new PrismaClient();

// 現在のユーザーのプロフィール情報を取得するエンドポイント
app.get("/me", async c => {
  try {
    // リクエストヘッダーからユーザーIDを取得
    const userId = c.req.header("x-user-id");

    // ユーザーIDが存在しない場合は401エラーを返す
    if (!userId) {
      return c.json({ error: "User ID is required" }, 401);
    }

    // ユーザーIDに紐づくプロフィール情報をデータベースから取得
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      include: {
        user: true, // 関連するユーザー情報も取得
      },
    });

    // プロフィールが存在しない場合は404エラーを返す
    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // プロフィール情報を返す
    return c.json({ profile: userProfile });
  } catch (error) {
    // 例外発生時は500エラーを返す
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// 指定されたユーザーIDのプロフィール情報を取得するエンドポイント
app.get("/:userId", async c => {
  try {
    // パスパラメータから対象ユーザーIDを取得
    const targetUserId = c.req.param("userId");

    // ユーザーIDが指定されていない場合は400エラーを返す
    if (!targetUserId) {
      return c.json({ error: "User ID parameter is required" }, 400);
    }

    // 対象ユーザーIDのプロフィール情報をデータベースから取得
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: targetUserId },
      include: {
        user: true, // 関連するユーザー情報も取得
      },
    });

    // プロフィールが存在しない場合は404エラーを返す
    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // プロフィールのステータスが"approved"でない場合は403エラーを返す
    if (userProfile.status !== "approved") {
      return c.json({ error: "Profile not available" }, 403);
    }

    // プロフィール情報を返す
    return c.json({ profile: userProfile });
  } catch (error) {
    // 例外発生時は500エラーを返す
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// 現在のユーザーのプロフィール情報を更新するエンドポイント
app.put("/me", async c => {
  try {
    // リクエストヘッダーからユーザーIDを取得
    const userId = c.req.header("x-user-id");

    // ユーザーIDが存在しない場合は401エラーを返す
    if (!userId) {
      return c.json({ error: "User ID is required" }, 401);
    }

    // リクエストボディから更新データを取得
    const body = await c.req.json();

    // 更新するプロフィールデータを作成
    const updateData: UpdateProfileData = {};
    if (body.nickname) updateData.nickname = body.nickname;
    if (body.selfIntroduction !== undefined)
      updateData.selfIntroduction = body.selfIntroduction;
    if (body.profileImageUrl !== undefined)
      updateData.profileImageUrl = body.profileImageUrl;

    // ニックネームが50文字を超えている場合は400エラーを返す
    if (updateData.nickname && updateData.nickname.length > 50) {
      return c.json({ error: "Nickname must be 50 characters or less" }, 400);
    }

    // プロフィール情報をデータベースで更新
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: userId },
      data: updateData,
      include: {
        user: true, // 関連するユーザー情報も取得
      },
    });

    // 更新後のプロフィール情報を返す
    return c.json({
      profile: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    // 例外発生時は500エラーを返す
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

export default app;
