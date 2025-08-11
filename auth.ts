import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "./sanctuary-api/src/generated/prisma";

// Prismaクライアントをグローバルに保持し、開発環境では再利用する
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// NextAuthの設定。PrismaアダプターとGoogleプロバイダーを使用
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // Prismaアダプターを使用してDB連携
  providers: [
    // Google認証プロバイダーの設定
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // サインイン時のコールバック
    async signIn({ user, account, profile }) {
      try {
        // Googleログイン時のみ処理を実行
        if (account?.provider === "google" && user?.id) {
          // 既存のUserProfileをチェック
          const existingProfile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
          });
          // UserProfileが存在しない場合は新規作成
          if (!existingProfile) {
            console.log(`Creating UserProfile for new user: ${user.email}`);

            await prisma.userProfile.create({
              data: {
                userId: user.id,
                nickname: user.name || user.email?.split("@")[0] || "Unknown", // ニックネーム設定
                selfIntroduction: null, // 自己紹介は初期値null
                profileImageUrl: user.image, // Googleのプロフィール画像
                gratitudePoints: 0, // 初期感謝ポイント
                currentTreeStage: "seed", // 初期ステージ
                status: "approved", // 初期ステータス
                role: "user", // デフォルトは一般ユーザー
              },
            });

            console.log(
              `UserProfile created successfully for user: ${user.email}`
            );
          }
        }

        return true; // サインイン成功
      } catch (error) {
        console.error("Error creating UserProfile:", error);
        return true; // エラー時もtrueを返す
      }
    },
    // セッションコールバックでユーザーIDとロールをセッションに追加
    async session({ session, user }) {
      session.user.id = user.id; // ユーザーIDを追加
      try {
        // ユーザープロファイルからロールを取得
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
          select: { role: true },
        });

        session.user.role = userProfile?.role || "user"; // ロールをセッションに追加
      } catch (error) {
        console.error("Error fetching user role:", error);
        session.user.role = "user"; // エラー時はデフォルトロール
      }
      return session;
    },
  },
});
