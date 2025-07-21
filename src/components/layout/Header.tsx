import Link from "next/link";
import { useAuth } from "@/app/providers/AuthContext";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/supabase/client";

export const Header = () => {
  const { user } = useAuth();

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
    <header>
      <div className="flex items-center justify-between bg-orange-100 px-6 py-4 shadow-sm">
        <Link href="/" className="text-xl font-bold text-orange-800">
          Sanctuary
        </Link>
        <nav>
          <div className="flex items-center justify-end gap-4">
            <p className="text-sm md:text-base">
              <span className="hidden md:inline">こんにちは、</span>
              {user?.user_metadata.full_name || user?.email || "ゲスト"}さん
            </p>
            {user ? (
              <Button onClick={handleLogout}>ログアウト</Button>
            ) : (
              <Button onClick={handleGoogleSignIn}>ログイン</Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
