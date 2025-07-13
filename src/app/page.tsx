"use client";

import { Button } from "@/components/ui/button";

import { client } from "@/lib/supabase/client";
import { useAuth } from "@/app/providers/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostForm } from "@/components/post/PostForm";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="items-center justify-center gap-6 flex-grow">
        <h1>Welcome to Sanctuary</h1>
        {loading ? (
          <p>読み込み中...</p>
        ) : user ? (
          <div>
            <PostForm />
          </div>
        ) : (
          <div>
            <p>ログインしていません</p>
            <Button className="items-center" onClick={handleGoogleSignIn}>
              Googleでサインイン
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
