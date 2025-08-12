"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { PostForm } from "@/components/post/PostForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Timeline } from "@/components/post/Timeline";
import { Header } from "@/components/layout/Header";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { LogIn, House } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  // 認証状態のローディング中
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="shadow-lg">
          <CardContent className="text-center py-8">
            <p>読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 未認証の場合のログイン画面
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="shadow-lg max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-orange-800 flex items-center justify-center">
              <House className="w-5 h-5 mr-2" />
              Sanctuary へようこそ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              ありがとうと応援が育つ、心の安全地帯
            </p>
            <Button
              onClick={() => signIn("google")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Googleでログイン
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 認証済みの場合
  return (
    <div className="min-h-screen">
      {/* ヘッダー部分 */}
      <Header />

      {/* 3カラムレイアウト */}
      <ThreeColumnLayout
        leftSidebar={<LeftSidebar />}
        rightSidebar={<RightSidebar />}
      >
        <PostForm />
        <Timeline />
      </ThreeColumnLayout>
    </div>
  );
}
