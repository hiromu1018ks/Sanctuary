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
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // セッションコールバックでユーザーIDをセッションに追加
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
