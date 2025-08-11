import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";

export const Header = () => {
  const { data: session } = useSession();
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/profile/me")
        .then(res => res.json())
        .then(data => setUserNickname(data.profile?.nickname))
        .catch(() => setUserNickname(null));
    }
  }, [session?.user?.id]);

  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = userNickname || session?.user?.name || "ユーザー";

  return (
    <header role="banner" className="sticky top-0 z-50 w-full">
      {/* スキップリンク（アクセシビリティ） */}
      <a
        href="#main-content"
        className="skip-link"
        tabIndex={0}
      >
        メインコンテンツにスキップ
      </a>
      
      <div className="flex items-center justify-between bg-orange-100 px-4 sm:px-6 py-4 shadow-sm">
        <Link 
          href="/" 
          className="text-xl font-bold text-orange-800"
          aria-label="Sanctuary ホームページに移動"
        >
          Sanctuary
        </Link>
        
        <nav role="navigation" aria-label="メインナビゲーション">
          <div className="flex items-center justify-end gap-4">
            {session?.user ? (
              <>
                <p 
                  className="text-sm md:text-base"
                  aria-live="polite"
                  id="user-greeting"
                >
                  <span className="hidden md:inline">こんにちは、</span>
                  {displayName}さん
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="p-0"
                      aria-label={`ユーザーメニュー: ${displayName}`}
                      aria-expanded="false"
                      aria-haspopup="menu"
                      aria-describedby="user-greeting"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={`${displayName}のプロフィール画像`}
                        />
                        <AvatarFallback aria-label={`${displayName}のイニシャル`}>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" role="menu">
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/profile"
                        role="menuitem"
                        aria-label="プロフィールページに移動"
                      >
                        プロフィール
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      role="menuitem"
                      aria-label="アカウントからログアウト"
                    >
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={handleGoogleSignIn}
                className="bg-orange-500 px-4 py-2 text-white rounded hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Googleアカウントでサインイン"
              >
                サインイン
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
