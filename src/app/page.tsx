"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/supabase/client";
import { useAuth } from "@/app/providers/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostForm } from "@/components/post/PostForm";
import { Timeline } from "@/components/post/Timeline";

export default function Home() {
  const { user, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        {user ? (
          // ログイン済み：SNSメイン画面
          <div className="container mx-auto py-8 space-y-8">
            <PostForm />
            <Timeline />
          </div>
        ) : (
          // 未ログイン：ランディングページ
          <div className="flex items-center justify-center px-4">
            <div className="max-w-md text-center space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  ✨ Sanctuary
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  「ありがとう」と「応援」が育つ、
                  <br />
                  心の安全地帯
                </p>
                <p className="text-sm text-gray-500">
                  Sanctuaryは、ポジティブな投稿だけが共有される
                  <br />
                  温かいコミュニティです
                </p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                size="lg"
              >
                🔑 Googleでサインイン
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
