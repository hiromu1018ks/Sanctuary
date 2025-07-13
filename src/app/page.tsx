"use client";

import { Button } from "@/components/ui/button";

import { client } from "@/lib/supabase/client";
import { useAuth } from "@/app/providers/AuthContext";

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

  const handleLogout = async () => {
    await client.auth.signOut();
  };
  return (
    <div>
      <h1>Welcome to Sanctuary</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : user ? (
        <div>
          <p>こんにちは、{user.email}さん！</p>
          <Button onClick={handleLogout}>ログアウト</Button>
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
  );
}
