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
import { Heart, User, LogOut, Shield } from "lucide-react";

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

  const displayName = userNickname || session?.user?.name || "User";

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
      
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 px-4 sm:px-6 py-4 shadow-lg border-b border-orange-200">
        <Link 
          href="/" 
          className="flex items-center space-x-3 group"
          aria-label="Sanctuary ホームページに移動"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-800 transition-all duration-200">
            Sanctuary
          </span>
        </Link>
        
        <nav role="navigation" aria-label="メインナビゲーション">
          <div className="flex items-center justify-end gap-4">
            {session?.user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block">
                    <p 
                      className="text-sm font-medium text-gray-700"
                      aria-live="polite"
                      id="user-greeting"
                    >
                      <span className="text-orange-600 font-semibold">こんにちは、</span>
                      <span className="text-gray-800">{displayName}さん</span>
                    </p>
                  </div>
                  
                  <div className="relative">
                    {/* オンラインステータスインジケーター */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm animate-pulse z-10" />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="p-0 hover:bg-transparent"
                          aria-label={`ユーザーメニュー: ${displayName}`}
                          aria-expanded="false"
                          aria-haspopup="menu"
                          aria-describedby="user-greeting"
                        >
                          <Avatar className="w-10 h-10 ring-3 ring-orange-200 ring-offset-2 ring-offset-white hover:ring-orange-300 transition-all duration-200 hover:scale-105">
                            <AvatarImage
                              src={session.user.image || ""}
                              alt={`${displayName}のプロフィール画像`}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold" aria-label={`${displayName}のイニシャル`}>
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" role="menu" className="w-56 p-2 shadow-xl border border-gray-100">
                        <DropdownMenuItem asChild>
                          <Link 
                            href="/profile"
                            role="menuitem"
                            aria-label="プロフィールページに移動"
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">プロフィール</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleLogout}
                          role="menuitem"
                          aria-label="アカウントからログアウト"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">ログアウト</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            ) : (
              <Button 
                onClick={handleGoogleSignIn}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-2.5 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Googleアカウントでサインイン"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>サインイン</span>
                </div>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
