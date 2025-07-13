"use client";

import { Button } from "@/components/ui/button";

import { client } from "@/lib/supabase/client";

export default function Home() {
  const handleGoogleSignIn = async () => {
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  };
  return (
    <div>
      <h1>Welcome to Sanctuary</h1>
      <Button className="items-center" onClick={handleGoogleSignIn}>
        Googleでサインイン
      </Button>
    </div>
  );
}
